const betsRouter = require('express').Router()
const Bet = require('../models/bet')
const Game = require('../models/game')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')



betsRouter.get('/', async (request, response) => {
  const bets = await Bet.find({})
    .populate('user', { username: 1 })
    .populate('game', { home_team: 1, visitor_team: 1, date: 1 })
  response.json(bets)
})

betsRouter.get('/:id', async (request, response) => {
  const bet = await Bet.findById(request.params.id)
    .populate('user', { username: 1 })
    .populate('game', { home_team: 1, visitor_team: 1, date: 1 })
  if (bet) {
    response.json(bet)
  } else {
    response.status(404).end()
  }
})

betsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = request.user

  const game = await Game.findById(body.game)
  /*
  const date = new Date(game.date)
  const now = new Date()

  if (date < now) {
    return response.status(400).json({ error: 'Bet cannot be added for past games' })
  }
*/
  const existingBet = await Bet.findOne({ user: user._id, game: game._id })

  if (existingBet) {
    return response.status(400).json({ error: 'User has already placed a bet on this game' })
  }

  if (body.goals_home === '' || body.goals_visitor === '') {
    return response.status(400).json({ error: 'Some of the required fields are missing' })
  }

  const bet = new Bet({
    goals_home: Number(body.goals_home),
    goals_visitor: Number(body.goals_visitor),
    game: game._id,
    user: user._id
  })

  const savedBet = await bet.save()
  game.bets = game.bets.concat(savedBet._id)


  user.bets = user.bets.concat(savedBet._id)
  await user.save()
  await game.save()

  response.status(201).json(savedBet)

})



betsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }
  const bet = await Bet.findById(request.params.id)
  const game = await Game.findById(bet.game)
  const user = request.user

  const date = new Date(game.date)
  const now = new Date()

  if (date < now) {
    return response.status(400).json({ error: 'Deleting bets is not allowed for past games' })
  }

  if ( bet.user.toString() === user.id.toString() || user.admin ) {
    await Bet.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'authorization failed' })
  }
})


betsRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }
  const { goals_home, goals_visitor } = request.body

  const bet = await Bet.findById(request.params.id)
  const game = await Game.findById(bet.game)
  const user = request.user

  const date = new Date(game.date)
  const now = new Date()

  if (date < now) {
    return response.status(400).json({ error: 'Editing bets is not allowed for past games' })
  }
  if ( bet.user.toString() === user.id.toString() || user.admin ) {

    Bet.findByIdAndUpdate(
      request.params.id,
      { goals_home, goals_visitor },
      { new: true, runValidators: true, context: 'query' }
    )
      .then(updatedBet => {
        response.json(updatedBet)
      })
      .catch(error => next(error))

  } else {
    response.status(401).json({ error: 'authorization failed' })
  }
})

module.exports = betsRouter