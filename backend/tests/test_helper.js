const Bet = require('../models/bet')
const Game = require('../models/game')
const Outcome = require('../models/outcome')
const Scores = require('../models/scores')
const Tournament = require('../models/tournament')
const User = require('../models/user')


const initialGames = [
  {
    home_team: 'FIN',
    visitor_team: 'SWE',
    date: '1.1.2023'
  },
  {
    home_team: 'USA',
    visitor_team: 'DEU',
    date: '1.1.2025'
  },
]

const nonExistingId = async () => {
  const game = new Game({
    home_team: 'FIN',
    visitor_team: 'BEL',
    date: '2.2.2024'
  })
  await game.save()
  await game.deleteOne()

  return game._id.toString()
}

const gamesInDb = async () => {
  const games = await Game.find({})
  return games.map(g => g.toJSON())
}

const betsInDb = async () => {
  const bets = await Bet.find({})
  return bets.map(b => b.toJSON())
}

const outcomesInDb = async () => {
  const outcomes = await Outcome.find({})
  return outcomes.map(o => o.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const tournamentsInDb = async () => {
  const tournaments = await Tournament.find({})
  return tournaments.map(t => t.toJSON())
}

const scoresInDb = async () => {
  const scores = await Scores.find({})
  return scores.map(s => s.toJSON())
}


module.exports = {
  initialGames,
  nonExistingId,
  gamesInDb,
  usersInDb,
  betsInDb,
  outcomesInDb,
  tournamentsInDb,
  scoresInDb
}