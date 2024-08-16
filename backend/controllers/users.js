const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
  // await User.deleteMany({})
  const users = await User.find({}).populate('bets', { goals_home: 1, goals_visitor:1, game: 1 })
  response.json(users)
})



usersRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})


usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
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
