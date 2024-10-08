const gamesRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Game = require('../models/game')
const Tournament = require('../models/tournament')
const middleware = require('../utils/middleware')


gamesRouter.get('/', async (request, response) => {

  const games = await Game.find({})
    .populate({
      path: 'tournament',
      select: 'name from_date to_date',
    })
    .populate({
      path: 'bets',
      select: 'goals_home goals_visitor user',
      populate: {
        path: 'user',
        select: 'username'
      }
    })
    .populate({
      path: 'outcome',
      select: 'goals_home goals_visitor',
    })

  response.json(games)
})

gamesRouter.get('/:id', async (request, response) => {
  const game = await Game.findById(request.params.id)
    .populate({
      path: 'tournament',
      select: 'name from_date to_date',
    })
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
  const tournament = await Tournament.findById(body.tournament)

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

  if (!body.home_team || !body.visitor_team || !body.date) {
    return response.status(400)
      .json({ error:
      'Some required fields are missing.'
      })
  }


  if (body.home_team.toLowerCase() === body.visitor_team.toLowerCase()) {
    return response.status(400)
      .json({ error:
      'Home and visitor teams must be different.'
      })
  }

  const date = new Date(body.date)
  const now = new Date()
  const tournamentFrom = new Date(tournament.from_date)
  const tournamentTo = new Date(tournament.to_date)
  tournamentTo.setHours(23, 59, 0, 0)
  now.setHours(0, 0, 0, 0)

  if (date <= now) {
    return response.status(400).json({ error: 'Set a future date.' })
  }

  if ( tournamentFrom > date || tournamentTo < date) {
    return response.status(400)
      .json({ error:
      'Set the date within the tournament period.'
      })
  }

  const existingGame = await Game.findOne({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date,
    outcome: null,
    tournament: body.tournament
  })

  if (existingGame) {
    return response.status(400)
      .json({ error:
      'A game with the same teams and date already exists in this tournament.'
      })
  }

  const game = new Game({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date,
    tournament: body.tournament
  })

  const savedGame = await game.save()
  tournament.games = tournament.games.concat(savedGame._id)
  await tournament.save()
  response.status(201).json(savedGame)

})

gamesRouter
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

    await Game.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
  )


gamesRouter.put('/:id', middleware.userExtractor, async (request, response) => {
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
  const { home_team, visitor_team, date, tournament } = request.body

  const newTournament = await Tournament.findById(tournament)
  const initialGame = await Game.findById(request.params.id)
  const oldTournament = await Tournament.findById(initialGame.tournament)

  const newDate = new Date(date)
  const tournamentFrom = new Date(newTournament.from_date)
  const tournamentTo = new Date(newTournament.to_date)
  tournamentTo.setHours(23, 59, 0, 0)


  if ( tournamentFrom > newDate || tournamentTo < newDate) {
    return response.status(400)
      .json({ error:
      'Set the game date within the tournament period.'
      })
  }

  if (visitor_team.toLowerCase() === home_team.toLowerCase()) {
    return response.status(400)
      .json({ error:
      'Home and visitor teams must be different.'
      })
  }


  const updatedGame = await Game.findByIdAndUpdate(
    request.params.id,
    { home_team, visitor_team, date, tournament },
    { new: true, runValidators: true, context: 'query' }
  )


  if (newTournament._id.equals(initialGame.tournament)) {
    response.status(200).json(updatedGame)

  } else {
    await Tournament.findByIdAndUpdate(
      oldTournament.id,
      { $pull: { games: initialGame._id } }
    )

    await Tournament.findByIdAndUpdate(
      newTournament.id,
      { $push: { games: initialGame._id } }
    )

    response.status(200).json(updatedGame)

  }

})

module.exports = gamesRouter
