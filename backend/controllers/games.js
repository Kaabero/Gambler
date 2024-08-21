const gamesRouter = require('express').Router()
const Game = require('../models/game')
const jwt = require('jsonwebtoken')


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}


gamesRouter.get('/', async (request, response) => {

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

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }


  if (body.home_team.toLowerCase() === body.visitor_team.toLowerCase()) {
    return response.status(400).json({ error: 'Home team and visitor team must be different' })
  }

  const date = new Date(body.date)
  const now = new Date()

  if (date < now) {
    return response.status(400).json({ error: 'Set a future date' })
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
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }
  await Game.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


gamesRouter.put('/:id', (request, response, next) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }
  const { home_team, visitor_team, date } = request.body

  Game.findByIdAndUpdate(
    request.params.id,
    { home_team, visitor_team, date },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedGame => {
      response.json(updatedGame)
    })
    .catch(error => next(error))
})

module.exports = gamesRouter
