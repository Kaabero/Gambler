const outcomesRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Game = require('../models/game')
const Outcome = require('../models/outcome')
const middleware = require('../utils/middleware')


outcomesRouter.get('/', async (request, response) => {
  const outcomes = await Outcome.find({})
    .populate({
      path: 'game',
      select: 'home_team visitor_team date bets tournament',
      populate: [
        {
          path: 'bets',
          select: 'goals_home goals_visitor user',
          populate: {
            path: 'user',
            select: 'username'
          }
        },
        {
          path: 'tournament',
          select: 'name',

        },
      ]
    })
    .populate({
      path: 'scores',
      select: 'points user',
      populate: {
        path: 'user',
        select: 'username'
      }
    })

  response.json(outcomes)

})

outcomesRouter.get('/:id', async (request, response) => {
  const outcome = await Outcome.findById(request.params.id)
    .populate({
      path: 'game',
      select: 'home_team visitor_team date bets tournament',
      populate: [
        {
          path: 'bets',
          select: 'goals_home goals_visitor user',
          populate: {
            path: 'user',
            select: 'username'
          }
        },
        {
          path: 'tournament',
          select: 'name',

        },
      ]
    })
    .populate({
      path: 'scores',
      select: 'points user',
      populate: {
        path: 'user',
        select: 'username'
      }
    })

  if (outcome) {
    response.json(outcome)
  } else {
    response.status(404).end()
  }
})

outcomesRouter.post('/', middleware.userExtractor, async (request, response) =>
{
  const body = request.body

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

  const game = await Game.findById(body.game)


  const date = new Date(game.date)
  const now = new Date()

  if (date > now) {
    return response.status(400)
      .json({ error:
      'Outcome can not be added for future games'
      })
  }

  if (body.goals_home === '' || body.goals_visitor === '') {
    return response.status(400)
      .json({ error:
      'Some of the required fields are missing'
      })
  }

  const outcome = new Outcome({
    goals_home: Number(body.goals_home),
    goals_visitor:Number(body.goals_visitor),
    game: game._id,
  })

  const savedOutcome = await outcome.save()
  game.outcome = outcome._id
  await game.save()
  response.status(201).json(savedOutcome)

}
)

outcomesRouter
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

    await Outcome.findByIdAndDelete(request.params.id)
    response.status(204).end()
  })


module.exports = outcomesRouter
