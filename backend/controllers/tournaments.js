const tournamentsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Tournament = require('../models/tournament')
const middleware = require('../utils/middleware')


tournamentsRouter.get('/', async (request, response) => {
  const tournaments = await Tournament.find({})
    .populate({
      path: 'games',
      select: 'home_team visitor_team date outcome',
      populate: {
        path: 'outcome',
        select: 'goals_home goals_visitor',
      },
    })


  response.json(tournaments)
})

tournamentsRouter.get('/:id', async (request, response) => {
  const tournament = await Tournament.findById(request.params.id)
    .populate({
      path: 'games',
      select: 'home_team visitor_team date outcome',
      populate: {
        path: 'outcome',
        select: 'goals_home goals_visitor',
      },
    })

  if (tournament) {
    response.json(tournament)
  } else {
    response.status(404).end()
  }
})



tournamentsRouter
  .post('/', middleware.userExtractor, async (request, response) => {
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

    if (body.name === '' || !body.from_date || !body.to_date) {
      return response.status(400)
        .json({ error:
        'Some required fields are missing.'
        })
    }

    const existingTournament = await Tournament.findOne({
      name: { $regex: new RegExp(`^${body.name}$`, 'i') },
    })

    if (existingTournament) {
      return response.status(400)
        .json({ error: `Tournament ${body.name} already exists. 
          Please choose a different name.`
        })
    }

    if (body.to_date === body.from_date) {
      return response.status(400).json({ error:
        'The start and end dates cannot be the same.'
      })
    }


    const from = new Date(body.from_date)
    const to = new Date(body.to_date)
    const now = new Date()
    now.setHours(0, 0, 0, 0)



    if (from < now) {
      return response.status(400).json({ error:
        'Please set a future starting date.'
      })
    }

    if (from === to || from > to) {
      return response.status(400).json({ error:
        'The end date must be after the start date.'
      })
    }

    const tournament = new Tournament({
      name: body.name,
      from_date: body.from_date,
      to_date: body.to_date
    })

    const savedTournament = await tournament.save()

    response.status(201).json(savedTournament)
  })




tournamentsRouter
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

    await Tournament.findByIdAndDelete(request.params.id)

    response.status(204).end()
  })

tournamentsRouter
  .put('/:id', middleware.userExtractor, async (request, response) => {
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
    const { name, from_date, to_date } = request.body

    const initialTournament = await Tournament.findById(request.params.id)
    const from = new Date(from_date)
    const to = new Date(to_date)


    if (from === to || from > to) {
      return response.status(400).json({ error:
        'The end date must be after the start date.'
      })
    }

    const existingTournament = await Tournament.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    })


    if (existingTournament && existingTournament.id !== initialTournament.id) {
      return response.status(400)
        .json({ error:
      `Tournament ${name} already exists. Please choose a different name.`
        })
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      request.params.id,
      { name, from_date, to_date },
      { new: true, runValidators: true, context: 'query' }
    )

    response.status(200).json(updatedTournament)

  })

module.exports = tournamentsRouter

