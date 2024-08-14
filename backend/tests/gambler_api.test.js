const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Game = require('../models/game')

const initialGames = [
  {
    home_team: 'FIN',
    visitor_team: 'SWE',
    date: '1.1.2023',
    outcome_added: false,
  },
  {
    home_team: 'USA',
    visitor_team: 'DEN',
    date: '1.1.2025',
    outcome_added: true,
  },
]

beforeEach(async () => {
  await Game.deleteMany({})

  let gameObject = new Game(initialGames[0])
  await gameObject.save()

  gameObject = new Game(initialGames[1])
  await gameObject.save()
})

test('games are returned as json', async () => {
  await api
    .get('/api/games')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two games', async () => {
  const response = await api.get('/api/games')

  assert.strictEqual(response.body.length, 2)
})

test('the first game is FIN-SWE', async () => {
  const response = await api.get('/api/games')

  const home_team = response.body.map(e => e.home_team)

  const visitor_team = response.body.map(e => e.visitor_team)

  assert(home_team[0].includes('FIN'))
  assert(visitor_team[0].includes('SWE'))
})

after(async () => {
  await mongoose.connection.close()
})