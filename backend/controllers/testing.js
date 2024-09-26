const bcrypt = require('bcrypt')
const testRouter = require('express').Router()

const Bet = require('../models/bet')
const Game = require('../models/game')
const Outcome = require('../models/outcome')
const Scores = require('../models/scores')
const Tournament = require('../models/tournament')
const User = require('../models/user')



testRouter.post('/reset', async (request, response) => {

  await Scores.deleteMany({})
  await User.deleteMany({})
  await Bet.deleteMany({})
  await Game.deleteMany({})
  await Outcome.deleteMany({})
  await Tournament.deleteMany({})

  response.status(204).end()
})

testRouter.post('/insert', async (request, response) => {

  const passwordHash = await bcrypt.hash('Password1!', 10)

  const testUser = new User({
    username: 'testuser',
    passwordHash: passwordHash,
    admin: false
  })

  const testAdmin = new User ({
    username: 'testadmin',
    passwordHash: passwordHash,
    admin: true
  })

  const saveduser = await testUser.save()
  const savedadmin = await testAdmin.save()
  const adminId = savedadmin._id
  const userId = saveduser._id

  const currentDate = new Date()


  const fromDate =
    new Date(currentDate.setFullYear(currentDate.getFullYear() -3))
      .toISOString()

  const toDate =
    new Date(new Date(fromDate)
      .setFullYear(new Date(fromDate).getFullYear() + 2))
      .toISOString()

  const tournament = new Tournament({
    name: 'tournament',
    from_date: fromDate,
    to_date: toDate,
  })


  const savedtournament = await tournament.save()
  const tournamentId = savedtournament._id

  const gameOne = new Game({
    home_team: 'future',
    visitor_team: 'game',
    date: new Date(currentDate.setFullYear(currentDate.getFullYear() +1))
      .toISOString(),
    tournament: tournamentId
  })

  const gameTwo = new Game({
    home_team: 'past',
    visitor_team: 'game',
    date: new Date(new Date().setFullYear(new Date().getFullYear() -1))
      .toISOString(),
    tournament: tournamentId
  })

  const savedGameOne = await gameOne.save()
  const gameOneId = savedGameOne._id
  const savedGameTwo = await gameTwo.save()
  const gameTwoId = savedGameTwo._id

  const outcome = new Outcome ({
    goals_home: 1,
    goals_visitor: 1,
    game: gameTwoId,
  })

  const savedOutcome = await outcome.save()
  const outcomeId = savedOutcome._id

  const newBet = new Bet ({
    goals_home: 1,
    goals_visitor: 1,
    game: gameOneId,
    user: userId
  })

  await newBet.save()

  const pastBet = new Bet ({
    goals_home: 2,
    goals_visitor: 2,
    game: gameTwoId,
    user: adminId
  })

  await pastBet.save()


  const scoresOne = new Scores({
    points: 1,
    user: adminId,
    outcome: outcomeId
  })


  await scoresOne.save()

  const gameThree = new Game({
    home_team: 'without',
    visitor_team: 'outcome',
    date: new Date(new Date().setFullYear(new Date().getFullYear() -2))
      .toISOString(),
    tournament: tournamentId
  })

  const savedGameThree = await gameThree.save()
  const gameThreeId = savedGameThree._id

  const openBet = new Bet ({
    goals_home: 1,
    goals_visitor: 1,
    game: gameThreeId,
    user: userId
  })

  await openBet.save()


  response.status(204).end()
})

module.exports = testRouter