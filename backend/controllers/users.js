const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


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
        select: 'game',
        populate: {
          path: 'game',
          select: 'home_team visitor_team'
        }
      }
    })
  response.json(users)
})



usersRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    passwordHash,
    admin: false,
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
  await User.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


usersRouter.put('/:id', (request, response, next) => {
  const { username, password } = request.body

  User.findByIdAndUpdate(
    request.params.id,
    { username, password },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedUser => {
      response.json(updatedUser.passwordHash)
    })
    .catch(error => next(error))
})

module.exports = usersRouter
