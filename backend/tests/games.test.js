const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Game = require('../models/game')


describe('returning initial games', () => {
  beforeEach(async () => {
    await Game.deleteMany({})
    await Game.insertMany(helper.initialGames)
  })

  test('games are returned as json', async () => {
    await api
      .get('/api/games')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all games are returned', async () => {
    const response = await api.get('/api/games')

    assert.strictEqual(response.body.length, helper.initialGames.length)
  })

  test('a specific game is within the returned games', async () => {
    const response = await api.get('/api/games')

    const home_teams = response.body.map(game => game.home_team)

    const visitor_teams = response.body.map(game => game.visitor_team)
    const dates = response.body.map(game => game.date)

    assert(home_teams[0].includes('FIN'))
    assert(visitor_teams[0].includes('SWE'))
    assert(dates[0].includes('1.1.2023'))
  })

  describe('viewing a specific game', () => {

    test('succeeds with a valid id', async () => {
      const gamesAtStart = await helper.gamesInDb()

      const gameToView = gamesAtStart[0]

      const resultGame = await api
        .get(`/api/games/${gameToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultGame.body, gameToView)
    })



    test('fails with statuscode 404 if game does not exist', async () => {
      const validNonexistingId = await helper.nonExistingGameId()

      await api
        .get(`/api/games/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/games/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new game', () => {
    test('succeeds with valid data', async () => {
      const newGame = {
        home_team: 'CZE',
        visitor_team: 'FRA',
        date: '1.1.2025',
      }

      await api
        .post('/api/games')
        .send(newGame)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)

      const home_teams = gamesAtEnd.map(r => r.home_team)
      assert(home_teams.includes('CZE'))
    })

    test('fails with status code 400 if data invalid', async () => {
      const newGame = {
        visitor_team: 'HUN',
        date: '1.1.2025'
      }

      await api
        .post('/api/games')
        .send(newGame)
        .expect(400)


      const gamesAtEnd = await helper.gamesInDb()

      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
    })
  })

  describe('deletion of a game', () => {

    test('succeeds with status code 204 if id is valid', async () => {
      const gamesAtStart = await helper.gamesInDb()
      const gameToDelete = gamesAtStart[0]

      await api
        .delete(`/api/games/${gameToDelete.id}`)
        .expect(204)

      const gamesAtEnd = await helper.gamesInDb()

      const ids = gamesAtEnd.map(r => r.id)
      assert(!ids.includes(gameToDelete.id))

      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length - 1)
    })
  })

  describe('modification of a game', () => {
    test('succeeds with status code 200 with valid data and valid id', async () => {
      const gamesAtStart = await helper.gamesInDb()

      const gameToModify = gamesAtStart[0]

      const modifiedGame = {
        visitor_team: 'TUR',
      }

      const resultGame = await api
        .put(`/api/games/${gameToModify.id}`)
        .send(modifiedGame)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultGame.body.id, gameToModify.id)
      assert.deepStrictEqual(resultGame.body.home_team, gameToModify.home_team)
      assert.deepStrictEqual(resultGame.body.date, gameToModify.date)
      assert.notEqual(resultGame.body.visitor_team, gameToModify.visitor_team)

    })

    test('fails with status code 400 if data invalid', async () => {
      const gamesAtStart = await helper.gamesInDb()

      const gameToModify = gamesAtStart[0]

      const modifiedGame = {
        visitor_team: 'HU',
      }
      await api
        .put(`/api/games/${gameToModify.id}`)
        .send(modifiedGame)
        .expect(400)

      const gamesAtEnd = await helper.gamesInDb()

      const visitor_teams = gamesAtEnd.map(g => g.visitor_team)
      assert(!visitor_teams.includes(modifiedGame.visitor_team))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)

    })
  })

  after(async () => {
    await mongoose.connection.close()
  })

})

