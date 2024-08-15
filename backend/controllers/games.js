const gamesRouter = require('express').Router()
const Game = require('../models/game')


gamesRouter.get('/', async (request, response) => {
  const games = await Game.find({})
  response.json(games)

})

gamesRouter.post('/', async (request, response) => {
  const body = request.body

  const game = new Game({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date,
    outcome_added: body.outcome_added || false,
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
  const { home_team, visitor_team, date, outcome_added } = request.body

  Game.findByIdAndUpdate(
    request.params.id,
    { home_team, visitor_team, date, outcome_added },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedGame => {
      response.json(updatedGame)
    })
    .catch(error => next(error))
})

module.exports = gamesRouter
