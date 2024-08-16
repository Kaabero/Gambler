const outcomesRouter = require('express').Router()
const Outcome = require('../models/outcome')


outcomesRouter.get('/', async (request, response) => {
//await Outcome.deleteMany({})
  const outcomes = await Outcome.find({}).populate('game', { home_team: 1, visitor_team: 1, date: 1, bets: 1 })
  response.json(outcomes)

})

outcomesRouter.post('/', async (request, response) => {
  const body = request.body

  const outcome = new Outcome({
    goals_home: Number(body.goals_home),
    goals_visitor:Number(body.goals_visitor),
    game: body.game,
  })

  const savedOutcome = await outcome.save()
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
