const scoresRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Outcome = require('../models/outcome')
const Scores = require('../models/scores')
const User = require('../models/user')
const middleware = require('../utils/middleware')


scoresRouter.get('/', async (request, response) => {

  const scores = await Scores.find({})
    .populate({
      path: 'points',
    })
    .populate({
      path: 'outcome',
      select: 'goals_home goals_visitor game',
      populate: {
        path: 'game',
        select: 'home_team visitor_team date tournament',
        populate: {
          path: 'tournament',
          select: 'name'
        }
      }
    })
    .populate({
      path: 'user',
      select: 'username',
    })

  response.json(scores)
})

scoresRouter.get('/:id', async (request, response) => {
  const score = await Scores.findById(request.params.id)
    .populate({
      path: 'points',
    })
    .populate({
      path: 'outcome',
      select: 'goals_home goals_visitor game',
      populate: {
        path: 'game',
        select: 'home_team visitor_team date tournament',
        populate: {
          path: 'tournament',
          select: 'name'
        }
      }
    })
    .populate({
      path: 'user',
      select: 'username',
    })

  if (score) {
    response.json(score)
  } else {
    response.status(404).end()
  }
})

scoresRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(400).end()
  }

  const user = request.user
  const pointsToUser = await User.findById(body.user)

  if (!user.admin) {
    return response.status(400)
      .json({ error:
      'This operation is for admins only.'
      })
  }

  if (!body.outcome || !body.user || body.points === '') {
    return response.status(400)
      .json({ error:
      'Some of the required fields are missing'
      })
  }

  const outcome = await Outcome.findById(body.outcome)


  if (!outcome) {
    return response.status(400).json({ error: 'Outcome not found' })
  }

  const existingScores = await Scores
    .findOne({ outcome: outcome._id, user: body.user })

  if (existingScores) {
    return response.status(400)
      .json({ error:
      'User has already received points for this outcome' })
  }

  const scores = new Scores({
    points: Number(body.points),
    user: body.user,
    outcome: outcome._id
  })


  pointsToUser.scores = pointsToUser.scores.concat(scores._id)
  outcome.scores = outcome.scores.concat(scores._id)

  await pointsToUser.save()
  await scores.save()
  await outcome.save()


  response.status(201).json(scores)

})

scoresRouter
  .delete('/:id', middleware.userExtractor, async (request, response) => {
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

    await Scores.findByIdAndDelete(request.params.id)
    response.status(204).end()
  })

scoresRouter.put('/:id', middleware.userExtractor, async (request, response) =>
{
  const { points } = request.body
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

  const updatedScores = await Scores.findByIdAndUpdate(
    request.params.id,
    { points },
    { new: true, runValidators: true, context: 'query' }
  )
  response.status(200).json(updatedScores)
}
)


module.exports = scoresRouter
