const betsRouter = require('express').Router()
const Bet = require('../models/bet')
const User = require('../models/user')



betsRouter.get('/', async (request, response) => {
  // await Bet.deleteMany({})
  const bets = await Bet.find({})
    .populate('user', { username: 1 })
    .populate('game', { home_team: 1, visitor_team: 1 })
  response.json(bets)
})

betsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.user)

  const bet = new Bet({
    goals_home: Number(body.goals_home),
    goals_visitor: Number(body.goals_visitor),
    game: body.game,
    user: user._id
  })

  const savedBet = await bet.save()

  user.bets = user.bets.concat(savedBet._id)
  await user.save()

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