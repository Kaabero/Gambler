const betsRouter = require('express').Router()
const Bet = require('../models/bet')



betsRouter.get('/', async (request, response) => {
  const bets = await Bet.find({})
  response.json(bets)

})

betsRouter.post('/', async (request, response) => {
  const body = request.body

  const bet = new Bet({
    goals_home: Number(body.goals_home),
    goals_visitor: Number(body.goals_visitor),
    game: body.game,
    user: body.user
  })

  const savedBet = await bet.save()
  response.status(201).json(savedBet)

})

betsRouter.get('/:id', async (request, response) => {
  const bet = await Bet.findById(request.params.id)
  if (bet) {
    response.json(bet)
  } else {
    response.status(404).end()
  }
})

betsRouter.delete('/:id', async (request, response) => {
  await Bet.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


betsRouter.put('/:id', (request, response, next) => {
  const { goals_home, goals_visitor, game, user } = request.body

  Bet.findByIdAndUpdate(
    request.params.id,
    { goals_home, goals_visitor, game, user },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedBet => {
      response.json(updatedBet)
    })
    .catch(error => next(error))
})

module.exports = betsRouter