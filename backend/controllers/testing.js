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



  const fromDate =
    new Date(new Date().setFullYear(new Date().getFullYear() - 3))
      .toISOString()

  const toDate =
    new Date(new Date().setFullYear(new Date().getFullYear() + 100))
      .toISOString()

  const tournamentOne = new Tournament({
    name: 'tournament',
    from_date: fromDate,
    to_date: toDate,
  })

  const tournamentTwo = new Tournament({
    name: 'tournamentTwo',
    from_date: fromDate,
    to_date: new Date(new Date().setFullYear(new Date().getFullYear() -2))
      .toISOString(),
  })


  const savedtournament = await tournamentOne.save()
  const tournamentId = savedtournament._id

  await tournamentTwo.save()


  const gameOne = new Game({
    home_team: 'upcoming',
    visitor_team: 'game',
    date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString(),
    tournament: tournamentId
  })

  const gameTwo = new Game({
    home_team: 'past',
    visitor_team: 'game',
    date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString(),
    tournament: tournamentId
  })

  const gameThree = new Game({
    home_team: 'without',
    visitor_team: 'outcome',
    date: new Date(new Date().setFullYear(new Date().getFullYear() -2))
      .toISOString(),
    tournament: tournamentId
  })


  const savedGameOne = await gameOne.save()
  const gameOneId = savedGameOne._id
  const savedGameTwo = await gameTwo.save()
  const gameTwoId = savedGameTwo._id
  const savedGameThree = await gameThree.save()
  const gameThreeId = savedGameThree._id


  const tournamentWithGames = await Tournament.findById(tournamentId.toString())

  tournamentWithGames.games = tournamentWithGames.games.concat(gameOneId)
  tournamentWithGames.games = tournamentWithGames.games.concat(gameTwoId)
  tournamentWithGames.games = tournamentWithGames.games.concat(gameThreeId)

  await tournamentWithGames.save()

  const outcome = new Outcome ({
    goals_home: 1,
    goals_visitor: 1,
    game: gameTwoId,
  })

  const gameWithOutcome = await Game.findById(gameTwoId.toString())

  const savedOutcome = await outcome.save()
  const outcomeId = savedOutcome._id

  gameWithOutcome.outcome = outcomeId

  await gameWithOutcome.save()

  const newBet = new Bet ({
    goals_home: 1,
    goals_visitor: 1,
    game: gameOneId,
    user: userId
  })

  const savedNewBet = await newBet.save()

  const gameOneWithBet = await Game.findById(gameOneId.toString())

  const user = await User.findById(userId.toString())

  user.bets = user.bets.concat(savedNewBet._id)

  gameOneWithBet.bets = gameOneWithBet.bets.concat(savedNewBet._id)


  const pastBet = new Bet ({
    goals_home: 2,
    goals_visitor: 2,
    game: gameTwoId,
    user: adminId
  })

  const savedPastBet = await pastBet.save()

  const gameTwoWithBet = await Game.findById(gameTwoId.toString())

  gameTwoWithBet.bets = gameTwoWithBet.bets.concat(savedPastBet._id)

  const admin = await User.findById(adminId.toString())

  admin.bets = admin.bets.concat(savedPastBet._id)

  const openBet = new Bet ({
    goals_home: 1,
    goals_visitor: 1,
    game: gameThreeId,
    user: userId
  })

  const savedOpenBet = await openBet.save()

  const gameThreeWithBet = await Game.findById(gameThreeId.toString())

  gameThreeWithBet.bets = gameThreeWithBet.bets.concat(savedOpenBet._id)

  user.bets = user.bets.concat(savedOpenBet._id)

  await gameOneWithBet.save()
  await gameTwoWithBet.save()
  await gameThreeWithBet.save()
  await user.save()


  const scoresOne = new Scores({
    points: 88,
    user: adminId,
    outcome: outcomeId
  })


  const savedScores = await scoresOne.save()

  const outcomeWithScores = await Outcome.findById(outcomeId.toString())

  outcomeWithScores.scores = outcomeWithScores.scores.concat(savedScores._id)

  admin.scores = admin.scores.concat(savedScores._id)

  await admin.save()
  await outcomeWithScores.save()


  response.status(200).json(tournamentId.toString())
})

module.exports = testRouter