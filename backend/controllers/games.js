const gamesRouter = require('express').Router()
const Game = require('../models/game')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')


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

gamesRouter.get('/:id', async (request, response) => {
  const game = await Game.findById(request.params.id)
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

  if (game) {
    response.json(game)
  } else {
    response.status(404).end()
  }
})

gamesRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }

  if (!body.home_team || !body.visitor_team || !body.date) {
    return response.status(400).json({ error: 'Some of the required fields are missing' })
  }


  if (body.home_team.toLowerCase() === body.visitor_team.toLowerCase()) {
    return response.status(400).json({ error: 'Home team and visitor team must be different' })
  }


  const date = new Date(body.date)
  const now = new Date()

  if (date < now) {
    return response.status(400).json({ error: 'Set a future date' })
  }

  const existingGame = await Game.findOne({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date
  })

  if (existingGame) {
    return response.status(400).json({ error: 'A game with the same teams and date already exists.' })
  }

  const game = new Game({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date
  })

  const savedGame = await game.save()
  response.status(201).json(savedGame)

})

gamesRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }

  await Game.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


gamesRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }
  const { home_team, visitor_team, date } = request.body

  const updatedGame = await Game.findByIdAndUpdate(
    request.params.id,
    { home_team, visitor_team, date },
    { new: true, runValidators: true, context: 'query' }
  )

  response.status(200).json(updatedGame)

})

module.exports = gamesRouter
