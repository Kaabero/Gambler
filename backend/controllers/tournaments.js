const tournamentsRouter = require('express').Router()
const Tournament = require('../models/tournament')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')


tournamentsRouter.get('/', async (request, response) => {
  const tournaments = await Tournament.find({})
    .populate('users', { username: 1 })
    .populate({
      path: 'games',
      select: 'home_team visitor_team date bets outcome',
      populate: [
        {
          path: 'bets',
          select: 'goals_home goals_visitor',
          populate: {
            path: 'user',
            select: 'username'
          }
        },
        {
          path: 'outcome',
          select: 'goals_home goals_visitor',
        },
      ]
    })

  response.json(tournaments)
})

tournamentsRouter.get('/:id', async (request, response) => {
  const tournament = await Tournament.findById(request.params.id)
    .populate('users', { username: 1 })
    .populate({
      path: 'games',
      select: 'home_team visitor_team date bets outcome',
      populate: [
        {
          path: 'bets',
          select: 'goals_home goals_visitor',
          populate: {
            path: 'user',
            select: 'username'
          }
        },
        {
          path: 'outcome',
          select: 'goals_home goals_visitor',
        },
      ]
    })
  if (tournament) {
    response.json(tournament)
  } else {
    response.status(404).end()
  }
})



tournamentsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { name } = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }

  const existingTournament = await Tournament.findOne({ name })

  if (existingTournament) {
    return response.status(400).json({ error: `Tournament ${name} already added` })
  }
  const newTournament = new Tournament({
    name,
  })

  const savedTournament = await newTournament.save()

  response.status(201).json(savedTournament)
})




tournamentsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }

  await Tournament.findByIdAndDelete(request.params.id)

  response.status(204).end()
})

tournamentsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }
  const { name } = request.body

  const updatedTournament = await Tournament.findByIdAndUpdate(
    request.params.id,
    { name },
    { new: true, runValidators: true, context: 'query' }
  )

  response.status(200).json(updatedTournament)

})

module.exports = tournamentsRouter

