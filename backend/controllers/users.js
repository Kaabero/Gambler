const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const middleware = require('../utils/middleware')



const validatePassword = (password) => {
  const regex
  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}



usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate({
      path: 'bets',
      select: 'goals_home goals_visitor game',
    })
    .populate({
      path: 'scores',
      select: 'points outcome',
      populate: {
        path: 'outcome',
        select: 'game goals_home goals_visitor',
        populate: {
          path: 'game',
          select: 'tournament',
        }
      }
    })
  response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
    .populate({
      path: 'bets',
      select: 'goals_home goals_visitor game',

    })
    .populate({
      path: 'scores',
      select: 'points outcome',
      populate: {
        path: 'outcome',
        select: 'game goals_home goals_visitor',
        populate: {
          path: 'game',
          select: 'tournament',
        }
      }
    })
  if (user) {
    response.json(user)
  } else {
    response.status(404).end()
  }
})



usersRouter.post('/', async (request, response) => {
  const { username, password, admin } = request.body

  const existingUser = await User.findOne({ username })

  if (existingUser) {
    return response.status(400).json({ error: 'Username already taken' })
  }

  if (!validatePassword(password)) {
    return response.status(400)
      .json({ error:
      `Password must be at least 8 characters long and include uppercase,
       lowercase, number, and special character`
      })
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


usersRouter
  .delete('/:id', middleware.userExtractor, async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = request.user

    if (!user.admin) {
      return response.status(400)
        .json({ error:
      'This operation is for admins only.'
        })
    }

    await User.findByIdAndDelete(request.params.id)
    response.status(204).end()
  })

usersRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user

  if (!user.admin) {
    return response.status(400)
      .json({ error:
      'This operation is for admins only.'
      })
  }
  const { admin } = request.body

  const updatedUser = await User.findByIdAndUpdate(
    request.params.id,
    { admin },
    { new: true, runValidators: true, context: 'query' }
  )

  response.status(200).json(updatedUser)

})


module.exports = usersRouter
