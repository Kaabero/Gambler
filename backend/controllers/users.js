const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}



usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate({
      path: 'bets',
      select: 'goals_home goals_visitor game',
      populate: {
        path: 'game',
        select: 'home_team visitor_team date'
      }
    })
    .populate({
      path: 'scores',
      select: 'points outcome',
      populate: {
        path: 'outcome',
        select: 'game goals_home goals_visitor',
        populate: {
          path: 'game',
          select: 'home_team visitor_team'
        }
      }
    })
  response.json(users)
})



usersRouter.post('/', async (request, response) => {
  const { username, password, admin } = request.body

  const existingUser = await User.findOne({ username })

  if (existingUser) {
    return response.status(400).json({ error: 'Username already taken' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const isTestEnvironment = process.env.NODE_ENV === 'test'


  const user = new User({
    username,
    passwordHash,
    admin: isTestEnvironment ? admin : false,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})


usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
    .populate({
      path: 'bets',
      select: 'goals_home goals_visitor game',
      populate: {
        path: 'game',
        select: 'home_team visitor_team date'
      }
    })
    .populate({
      path: 'scores',
      select: 'points outcome',
      populate: {
        path: 'outcome',
        select: 'game,'
      }
    })

  if (user) {
    response.json(user)
  } else {
    response.status(404).end()
  }
})

usersRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (!user.admin) {
    return response.status(400).json({ error: 'This operation is for admins only.' })
  }

  await User.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


module.exports = usersRouter
