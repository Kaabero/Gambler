const gamesRouter = require('express').Router()
const Game = require('../models/game')


gamesRouter.get('/', async (request, response) => {
  // await Game.deleteMany({})
  /*
  const games = await Game.find({})
    .populate('outcome', { goals_home: 1, goals_visitor:1 })
    .populate('bets', { goals_home: 1, goals_visitor:1, user: 1 })
*/

  const games = await Game.find({})
    .populate({
      path: 'outcome',
      select: 'goals_home goals_visitor',
    })
    .populate({
      path: 'bets',
      select: 'goals_home goals_visitor user',
      populate: {
        path: 'user',
        select: 'username'
      }
    })

  response.json(games)
})

gamesRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.home_team === body.visitor_team) {
    return response.status(400).json({ error: 'Home team and visitor team must be different' })
  }

  const game = new Game({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date
  })

  const savedGame = await game.save()
  response.status(201).json(savedGame)

})

gamesRouter.get('/:id', async (request, response) => {
  const game = await Game.findById(request.params.id)
  if (game) {
    response.json(game)
  } else {
    response.status(404).end()
  }
})

gamesRouter.delete('/:id', async (request, response) => {
  await Game.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


gamesRouter.put('/:id', (request, response, next) => {
  const { home_team, visitor_team, date, outcome } = request.body

  Game.findByIdAndUpdate(
    request.params.id,
    { home_team, visitor_team, date, outcome },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedGame => {
      response.json(updatedGame)
    })
    .catch(error => next(error))
})

module.exports = gamesRouter
