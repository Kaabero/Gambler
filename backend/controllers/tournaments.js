const tournamentsRouter = require('express').Router()
const Tournament = require('../models/tournament')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')


tournamentsRouter.get('/', async (request, response) => {
  const tournaments = await Tournament.find({})
    .populate('users', { username: 1 })
    .populate('games', { home_team: 1, visitor_team: 1, date: 1 })

  response.json(tournaments)
})

tournamentsRouter.get('/:id', async (request, response) => {
  const tournament = await Tournament.findById(request.params.id)
    .populate('users', { username: 1 })
    .populate('games', { home_team: 1, visitor_team: 1, date: 1 })
  if (tournament) {
    response.json(tournament)
  } else {
    response.status(404).end()
  }
})



tournamentsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { tournament } = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }

  const existingTournament = await Tournament.findOne({ tournament })

  if (existingTournament) {
    return response.status(400).json({ error: `Tournament ${tournament} already added` })
  }
  const newTournament = new Tournament({
    tournament,
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
  const { tournament } = request.body

  const updatedTournament = await Tournament.findByIdAndUpdate(
    request.params.id,
    { tournament },
    { new: true, runValidators: true, context: 'query' }
  )

  response.status(200).json(updatedTournament)

})

module.exports = tournamentsRouter

