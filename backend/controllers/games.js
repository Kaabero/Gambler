const gamesRouter = require('express').Router()
const Game = require('../models/game')




gamesRouter.get('/', (request, response) => {
  Game.find({}).then(games => {
    response.json(games)
  })
})

gamesRouter.post('/', (request, response, next) => {
  const body = request.body

  const game = new Game({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date,
    outcome_added: body.outcome_added || false,
  })

  game.save()
    .then(savedGame => {
      response.json(savedGame)
    })
    .catch(error => next(error))
})

gamesRouter.get('/:id', (request, response, next) => {
  Game.findById(request.params.id)
    .then(game => {
      if (game) {
        response.json(game)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

gamesRouter.delete('/:id', (request, response, next) => {
  Game.findByIdAndDelete(request.params.id)
    .then(result => {  // eslint-disable-line no-unused-vars
      response.status(204).end()
    })
    .catch(error => next(error))
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
