const assert = require('node:assert')
const { test, after, describe, beforeEach } = require('node:test')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Game = require('../models/game')
const Tournament = require('../models/tournament')
const User = require('../models/user')

const helper = require('./test_helper')


const testUser = {
  username: 'testuser',
  password: 'Password1!',
  admin: false
}


const testAdmin = {
  username: 'testadmin',
  password: 'Password1!',
  admin: true
}

const testTournament = {
  name: 'testTournament',
  from_date: '1.1.2024',
  to_date: '1.1.2026'
}

let token

let tournamentId

let initialGame

beforeEach(async () => {
  await Game.deleteMany({})
  await User.deleteMany({})
  await Tournament.deleteMany({})
})


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

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/games/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new game', () => {

  beforeEach(async () => {
    await Game.deleteMany({})
    await Tournament.deleteMany({})
    await Game.insertMany(helper.initialGames)
    await api
      .post('/api/users')
      .send(testAdmin)
    const loginresponse = await api
      .post('/api/login')
      .send(testAdmin)

    token = loginresponse.body.token
    const tournamentresponse = await api
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${token}`)
      .send(testTournament)

    tournamentId = tournamentresponse.body.id


  })

  test('succeeds with valid data and admin rights', async () => {


    const newGame = {
      home_team: 'valid',
      visitor_team: 'data',
      date: '1.1.2025',
      tournament: tournamentId
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

  test(
    'fails with status code 401 and proper message if token is invalid',
    async () => {
      const newGame = {
        home_team: 'token',
        visitor_team: 'invalid',
        date: '1.1.2025',
        tournament: tournamentId
      }

      const invalidToken = 'invalidtoken'

      const result = await api
        .post('/api/games')
        .send(newGame)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
    }
  )

  test(
    'fails with status code 400 if token is missing',
    async () => {
      const newGame = {
        home_team: 'token',
        visitor_team: 'missing',
        date: '1.1.2025',
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
    }
  )

  test('fails with status code 400 if date is outside tournament time period',
    async () => {


      const newGame = {
        home_team: 'outside',
        visitor_team: 'time period',
        date: '2.1.2026',
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes(
        'Set the date inside tournament time period'
      ))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
    }
  )

  test('fails with status code 400 if game already added',
    async () => {


      const newGame = {
        home_team: 'same',
        visitor_team: 'again',
        date: '1.1.2025',
        tournament: tournamentId
      }

      await api
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send(newGame)

      const sameGame = {
        home_team: 'same',
        visitor_team: 'again',
        date: '1.1.2025',
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send(sameGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)



      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes(
        'A game with the same teams and date already exists in this tournament.'
      ))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length+1)
    }
  )

  test(
    'fails with status code 400 and proper error message if data invalid',
    async () => {
      const newGame = {
        visitor_team: 'data invalid',
        date: '1.1.2025',
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const gamesAtEnd = await helper.gamesInDb()

      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)

      assert(result.body.error.includes(
        'Some of the required fields are missing'
      ))
    }
  )

  test('fails with status code 400 if home_team = visitor_team', async () => {


    const newGame = {
      home_team: 'team',
      visitor_team: 'Team',
      date: '1.1.2025',
      tournament: tournamentId
    }

    const result = await api
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(newGame)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes(
      'Home team and visitor team must be different'
    ))

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

  test('fails with status code 400 if token is missing', async () => {
    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]

    const result = await api
      .delete(`/api/games/${gameToDelete.id}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)

  })

  test('fails with status code 400 if token is invalid', async () => {
    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]

    const invalidToken = 'invalidtoken'

    const result = await api
      .delete(`/api/games/${gameToDelete.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)

  })
})

describe('modification of a game', () => {
  beforeEach(async () => {
    await Game.deleteMany({})
    await Tournament.deleteMany({})
    await Game.insertMany(helper.initialGames)
    await api
      .post('/api/users')
      .send(testAdmin)
    const loginresponse = await api
      .post('/api/login')
      .send(testAdmin)

    token = loginresponse.body.token
    const tournamentresponse = await api
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${token}`)
      .send(testTournament)

    tournamentId = tournamentresponse.body.id

    const newGame = {
      home_team: 'valid',
      visitor_team: 'data',
      date: '1.1.2025',
      tournament: tournamentId
    }

    const newgameresponse = await api
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(newGame)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    initialGame = newgameresponse.body

  })

  test('succeeds with status code 200 with valid data and id', async () => {

    const modifiedGame = {
      visitor_team: 'modified visitor_team',
      tournament: tournamentId
    }

    const resultGame = await api
      .put(`/api/games/${initialGame.id}`)
      .send(modifiedGame)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const gamesAtEnd = await helper.gamesInDb()

    assert.deepStrictEqual(resultGame.body.id, initialGame.id)
    assert.deepStrictEqual(
      resultGame.body.home_team, initialGame.home_team
    )
    assert.deepStrictEqual(
      resultGame.body.date, initialGame.date
    )
    assert.notEqual(
      resultGame.body.visitor_team,
      initialGame.visitor_team
    )
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length+1)
  })

  test(
    `fails with status code 400 and proper message 
    if date is outside tournament time period`,
    async () => {

      const modifiedGame = {
        visitor_team: 'improper date',
        date: '2.1.2026',
        tournament: tournamentId
      }

      const result = await api
        .put(`/api/games/${initialGame.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(modifiedGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      const visitor_teams = gamesAtEnd.map(g => g.visitor_team)
      assert(result.body.error.includes(
        'Set the game date inside tournament time period'
      ))
      assert(!visitor_teams.includes(modifiedGame.visitor_team))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length+1)
    }
  )

  test('fails with status code 400 if data is invalid', async () => {

    const modifiedGame = {
      visitor_team: 1,
      tournament: tournamentId
    }
    await api
      .put(`/api/games/${initialGame.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(modifiedGame)
      .expect(400)

    const gamesAtEnd = await helper.gamesInDb()

    const visitor_teams = gamesAtEnd.map(g => g.visitor_team)
    assert(!visitor_teams.includes(modifiedGame.visitor_team))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length+1)

  })

  test('fails with status code 400 if token is missing', async () => {

    const modifiedGame = {
      visitor_team: 'token missing',
      tournament: tournamentId
    }
    const result = await api
      .put(`/api/games/${initialGame.id}`)
      .send(modifiedGame)
      .expect(400)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes(
      'Token missing or invalid'
    ))

    const visitor_teams = gamesAtEnd.map(g => g.visitor_team)
    assert(!visitor_teams.includes(modifiedGame.visitor_team))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length+1)

  })
  test('fails with status code 400 if token is invalid', async () => {

    const modifiedGame = {
      visitor_team: 'invalid token',
      tournament: tournamentId
    }

    const invalidToken = 'invalidtoken'

    const result = await api
      .put(`/api/games/${initialGame.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(modifiedGame)
      .expect(400)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes('Token missing or invalid'))

    const visitor_teams = gamesAtEnd.map(g => g.visitor_team)
    assert(!visitor_teams.includes(modifiedGame.visitor_team))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
  })

  test(
    'succeeds with status code 200 when tournament is changed',
    async () => {

      const oldTournament = {
        name: 'oldTournament',
        from_date: '1.1.2024',
        to_date: '1.1.2026'
      }

      const oldtournamentresponse = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${token}`)
        .send(oldTournament)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const newGame = {
        home_team: 'changing',
        visitor_team: 'tournament',
        date: '1.1.2025',
        tournament: oldtournamentresponse.body.id
      }

      const newgameresponse = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send(newGame)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const newTournament = {
        name: 'newTournament',
        from_date: '1.1.2024',
        to_date: '1.1.2026'
      }

      const newtournamentresponse = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${token}`)
        .send(newTournament)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const modifiedGame = {
        visitor_team: 'modified visitor_team and tournament',
        tournament: newtournamentresponse.body.id
      }

      const resultGame = await api
        .put(`/api/games/${newgameresponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(modifiedGame)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      assert.deepStrictEqual(resultGame.body.id, newgameresponse.body.id)
      assert.deepStrictEqual(
        resultGame.body.home_team, newgameresponse.body.home_team
      )
      assert.deepStrictEqual(
        resultGame.body.date, newgameresponse.body.date
      )
      assert.notEqual(
        resultGame.body.visitor_team,
        newgameresponse.body.visitor_team
      )
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length+2)

      const updatedOldTournament = await api
        .get(`/api/tournaments/${oldtournamentresponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const updatedNewTournament = await api
        .get(`/api/tournaments/${newtournamentresponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(updatedOldTournament.body.games.length, 0)
      assert.strictEqual(updatedNewTournament.body.games.length, 1)
      assert.strictEqual(
        updatedNewTournament.body.games[0].id,
        newgameresponse.body.id
      )
    }
  )
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

  test('modification of a game fails with valid data and id', async () => {


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
  await Tournament.deleteMany({})
  await mongoose.connection.close()
})