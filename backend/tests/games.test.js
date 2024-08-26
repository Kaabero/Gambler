const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const User = require('../models/user')
const Game = require('../models/game')


const testUser = {
  username: 'testuser',
  password: 'password',
  admin: false
}


const testAdmin = {
  username: 'testadmin',
  password: 'password',
  admin: true
}

let token


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
})

describe('viewing a specific game', () => {
  beforeEach(async () => {
    await Game.deleteMany({})
    await Game.insertMany(helper.initialGames)
  })

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

  beforeEach(async () => {
    await Game.deleteMany({})
    await Game.insertMany(helper.initialGames)
    await api
      .post('/api/users')
      .send(testAdmin)
    const response = await api
      .post('/api/login')
      .send(testAdmin)



    token = response.body.token
  })

  test('succeeds with valid data and admin rights', async () => {


    const newGame = {
      home_team: 'valid',
      visitor_team: 'data',
      date: '1.1.2025',
    }

    await api
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(newGame)
      .expect(201)
      .expect('Content-Type', /application\/json/)





    const gamesAtEnd = await helper.gamesInDb()
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)

    const home_teams = gamesAtEnd.map(r => r.home_team)
    assert(home_teams.includes('valid'))
  })

  test('fails with status code 401 and proper message if token is invalid', async () => {

    const newGame = {
      home_team: 'token',
      visitor_team: 'invalid',
      date: '1.1.2025'
    }

    const result = await api
      .post('/api/games')
      .send(newGame)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const gamesAtEnd = await helper.gamesInDb()
    assert(result.body.error.includes('token missing or invalid'))

    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
  })



  test('fails with status code 400 if data invalid', async () => {
    const newGame = {
      visitor_team: 'data invalid',
      date: '1.1.2025'
    }

    await api
      .post('/api/games')
      .send(newGame)
      .expect(400)


    const gamesAtEnd = await helper.gamesInDb()

    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
  })

  test('fails with status code 400 if home_team = visitor_team', async () => {
    const newGame = {
      home_team: 'team',
      visitor_team: 'team',
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

  beforeEach(async () => {
    await Game.deleteMany({})
    await Game.insertMany(helper.initialGames)
    await api
      .post('/api/users')
      .send(testAdmin)
    const response = await api
      .post('/api/login')
      .send(testAdmin)


    token = response.body.token
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]

    await api
      .delete(`/api/games/${gameToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const gamesAtEnd = await helper.gamesInDb()

    const ids = gamesAtEnd.map(r => r.id)
    assert(!ids.includes(gameToDelete.id))

    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length - 1)
  })
})

describe('modification of a game', () => {
  beforeEach(async () => {
    await Game.deleteMany({})
    await Game.insertMany(helper.initialGames)
  })

  test('succeeds with status code 200 with valid data and valid id', async () => {
    await api
      .post('/api/users')
      .send(testAdmin)
    const response = await api
      .post('/api/login')
      .send(testAdmin)


    token = response.body.token

    const gamesAtStart = await helper.gamesInDb()

    const gameToModify = gamesAtStart[0]

    const modifiedGame = {
      visitor_team: 'modified visitor_team',
    }

    const resultGame = await api
      .put(`/api/games/${gameToModify.id}`)
      .send(modifiedGame)
      .set('Authorization', `Bearer ${token}`)
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
      visitor_team: 1,
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

describe('operations without admin rights: ', () => {

  beforeEach(async () => {
    await Game.deleteMany({})
    await Game.insertMany(helper.initialGames)
    await api
      .post('/api/users')
      .send(testUser)
    const response = await api
      .post('/api/login')
      .send(testUser)



    token = response.body.token
  })

  test('addition fails with valid data', async () => {


    const newGame = {
      home_team: 'not',
      visitor_team: 'admin',
      date: '1.1.2025',
    }

    const result = await api
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(newGame)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('This operation is for admins only.'))

  })

  test('modification of a game fails with valid data and valid id', async () => {


    const gamesAtStart = await helper.gamesInDb()

    const gameToModify = gamesAtStart[0]

    const modifiedGame = {
      visitor_team: 'modified visitor_team',
    }

    const resultGame = await api
      .put(`/api/games/${gameToModify.id}`)
      .send(modifiedGame)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(resultGame.body.error.includes('This operation is for admins only.'))

  })

  test('deletion of a game fails with valid id', async () => {
    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]

    const result = await api
      .delete(`/api/games/${gameToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    assert(result.body.error.includes('This operation is for admins only.'))


  })
})

after(async () => {
  await User.deleteMany({})
  await Game.deleteMany({})
  await mongoose.connection.close()
})