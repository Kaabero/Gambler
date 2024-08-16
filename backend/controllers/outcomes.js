const outcomesRouter = require('express').Router()
const Outcome = require('../models/outcome')
const Game = require('../models/game')


outcomesRouter.get('/', async (request, response) => {
//await Outcome.deleteMany({})
  const outcomes = await Outcome.find({})
    .populate({
      path: 'game',
      select: 'home_team visitor_team date bets',
      populate: {
        path: 'bets',
        select: 'goals_home goals_visitor user',
        populate: {
          path: 'user',
          select: 'username'
        }
      }
    })

  response.json(outcomes)

})

outcomesRouter.post('/', async (request, response) => {
  const body = request.body

  const game = await Game.findById(body.game)

  const outcome = new Outcome({
    goals_home: Number(body.goals_home),
    goals_visitor:Number(body.goals_visitor),
    game: game._id,
  })

  const savedOutcome = await outcome.save()
  game.outcome = outcome._id
  await game.save()
  response.status(201).json(savedOutcome)

})

outcomesRouter.get('/:id', async (request, response) => {
  const outcome = await Outcome.findById(request.params.id)
  if (outcome) {
    response.json(outcome)
  } else {
    response.status(404).end()
  }
})

outcomesRouter.delete('/:id', async (request, response) => {
  await Outcome.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


outcomesRouter.put('/:id', (request, response, next) => {
  const { goals_home, goals_visitor, game } = request.body

  Outcome.findByIdAndUpdate(
    request.params.id,
    { goals_home, goals_visitor, game },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedOutcome => {
      response.json(updatedOutcome)
    })
    .catch(error => next(error))
})

module.exports = outcomesRouter
