const Game = require('../models/game')
const User = require('../models/user')

const initialGames = [
  {
    home_team: 'FIN',
    visitor_team: 'SWE',
    date: '1.1.2023',
    outcome_added: true,
  },
  {
    home_team: 'USA',
    visitor_team: 'DEU',
    date: '1.1.2025',
    outcome_added: false,
  },
]

const nonExistingGameId = async () => {
  const game = new Game({ home_team: 'FIN', visitor_team: 'BEL', date: '2.2.2024' })
  await game.save()
  await game.deleteOne()

  return game._id.toString()
}

const gamesInDb = async () => {
  const games = await Game.find({})
  return games.map(game => game.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialGames, nonExistingGameId, gamesInDb, usersInDb
}