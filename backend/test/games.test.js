const assert = require('node:assert')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Game = require('../models/game')
const Tournament = require('../models/tournament')
const User = require('../models/user')

const helper = require('./test_helper')




const insertInitialData = async () => {

  await Game.deleteMany({})
  await User.deleteMany({})
  await Tournament.deleteMany({})

  await Game.insertMany(helper.initialGames)

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

  const tournamentForGameTesting = {
    name: 'tournamentForGameTesting',
    from_date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString(),
    to_date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 3))
      .toISOString(),
  }


  await api
    .post('/api/users')
    .send(testAdmin)
  const adminresponse = await api
    .post('/api/login')
    .send(testAdmin)

  await api
    .post('/api/users')
    .send(testUser)
  const userresponse = await api
    .post('/api/login')
    .send(testUser)

  const admintoken = adminresponse.body.token
  const usertoken = userresponse.body.token

  const tournamentresponse = await api
    .post('/api/tournaments')
    .set('Authorization', `Bearer ${admintoken}`)
    .send(tournamentForGameTesting)

  const tournamentId = tournamentresponse.body.id

  const newGame = {
    home_team: 'valid',
    visitor_team: 'data',
    date:
      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString(),
    tournament: tournamentId
  }

  const newgameresponse = await api
    .post('/api/games')
    .set('Authorization', `Bearer ${admintoken}`)
    .send(newGame)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const initialGame = newgameresponse.body

  return {
    admintoken,
    usertoken,
    tournamentId,
    initialGame
  }

}



describe('returning initial games', () => {

  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('games are returned as json', async () => {
    await api
      .get('/api/games')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('all games are returned', async () => {
    const response = await api.get('/api/games')

    assert.strictEqual(response.body.length, helper.initialGames.length+1)
  })

  it('a specific game is within the returned games', async () => {
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
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with a valid id', async () => {
    const gamesAtStart = await helper.gamesInDb()

    const gameToView = gamesAtStart[0]

    const resultGame = await api
      .get(`/api/games/${gameToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultGame.body, gameToView)
  })


  it('fails with statuscode 404 if game does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/games/${validNonexistingId}`)
      .expect(404)
  })

  it('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/games/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new game', () => {
  let values

  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with valid data and admin rights', async () => {

    const { tournamentId, admintoken } = values

    const newGame = {
      home_team: 'valid',
      visitor_team: 'data',
      date:
      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString(),
      tournament: tournamentId
    }

    await api
      .post('/api/games')
      .set('Authorization', `Bearer ${admintoken}`)
      .send(newGame)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const gamesAtEnd = await helper.gamesInDb()
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 2)

    const home_teams = gamesAtEnd.map(game => game.home_team)
    assert(home_teams.includes('valid'))
  })

  it(
    'fails with status code 401 and proper message if token is invalid',
    async () => {
      const { tournamentId } = values
      const newGame = {
        home_team: 'token',
        visitor_team: 'invalid',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
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
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
    }
  )

  it(
    'fails with status code 400 if token is missing',
    async () => {
      const { tournamentId } = values
      const newGame = {
        home_team: 'token',
        visitor_team: 'missing',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
    }
  )

  it('fails with status code 400 if date is outside tournament time period',
    async () => {
      const { tournamentId, admintoken } = values

      const newGame = {
        home_team: 'outside',
        visitor_team: 'time period',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes(
        'Set the date inside tournament time period'
      ))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
    }
  )

  it('fails with status code 400 if date is in the past',
    async () => {
      const { tournamentId, admintoken } = values

      const newGame = {
        home_team: 'in the',
        visitor_team: 'past',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          .toISOString(),
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes(
        'Set a future date'
      ))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length +1)
    }
  )

  it('fails with status code 400 if game already added',
    async () => {
      const { tournamentId, admintoken } = values

      const newGame = {
        home_team: 'same',
        visitor_team: 'again',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        tournament: tournamentId
      }

      await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newGame)

      const sameGame = { ...newGame }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(sameGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)



      const gamesAtEnd = await helper.gamesInDb()

      assert(result.body.error.includes(
        'A game with the same teams and date already exists in this tournament.'
      ))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 2)
    }
  )

  it(
    'fails with status code 400 and proper error message if data invalid',
    async () => {
      const { tournamentId, admintoken } = values

      const newGame = {
        visitor_team: 'data invalid',
        date: '1.1.2025',
        tournament: tournamentId
      }

      const result = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const gamesAtEnd = await helper.gamesInDb()

      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)

      assert(result.body.error.includes(
        'Some of the required fields are missing'
      ))
    }
  )

  it('fails with status code 400 if home_team = visitor_team', async () => {

    const { tournamentId, admintoken } = values
    const newGame = {
      home_team: 'team',
      visitor_team: 'Team',
      date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
      tournament: tournamentId
    }

    const result = await api
      .post('/api/games')
      .set('Authorization', `Bearer ${admintoken}`)
      .send(newGame)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes(
      'Home team and visitor team must be different'
    ))

    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
  })
})

describe('deletion of a game', () => {

  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with status code 204 if id is valid', async () => {

    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]
    const { admintoken } = values

    await api
      .delete(`/api/games/${gameToDelete.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(204)

    const gamesAtEnd = await helper.gamesInDb()

    const ids = gamesAtEnd.map(game => game.id)
    assert(!ids.includes(gameToDelete.id))

    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length)
  })

  it('fails with status code 400 if token is missing', async () => {
    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]

    const result = await api
      .delete(`/api/games/${gameToDelete.id}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)

  })

  it('fails with status code 400 if token is invalid', async () => {
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
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)

  })
})

describe('modification of a game', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with status code 200 with valid data and id', async () => {

    const { admintoken, initialGame } = values

    const modifiedGame = { ...initialGame, visitor_team: 'modified visitor_team' }

    const resultGame = await api
      .put(`/api/games/${initialGame.id}`)
      .send(modifiedGame)
      .set('Authorization', `Bearer ${admintoken}`)
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
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
  })

  it('fails with status code 400 if home_team = visitor_team', async () => {

    const { admintoken, initialGame } = values

    const modifiedGame = { ...initialGame, visitor_team: 'modified', home_team: 'MODIfied' }

    const result = await api
        .put(`/api/games/${initialGame.id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send(modifiedGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      const visitor_teams = gamesAtEnd.map(game => game.visitor_team)
      const home_teams = gamesAtEnd.map(game => game.home_team)
      assert(result.body.error.includes(
        'Home team and visitor team must be different'
      ))
      assert(!visitor_teams.includes(modifiedGame.visitor_team))
      assert(!home_teams.includes(modifiedGame.home_team))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
  })

  it(
    `fails with status code 400 and proper message 
    if date is outside tournament time period`,
    async () => {

      const { admintoken, initialGame } = values
  
      const modifiedGame = { ...initialGame, visitor_team: 'invalid date', date:  new Date(new Date().setFullYear(new Date().getFullYear() + 4))
        .toISOString() }

      const result = await api
        .put(`/api/games/${initialGame.id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send(modifiedGame)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const gamesAtEnd = await helper.gamesInDb()

      const visitor_teams = gamesAtEnd.map(game => game.visitor_team)
      assert(result.body.error.includes(
        'Set the game date inside tournament time period'
      ))
      assert(!visitor_teams.includes(modifiedGame.visitor_team))
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
    }
  )

  it('fails with status code 400 if data is invalid', async () => {
    const { admintoken, initialGame } = values


    const modifiedGame = { ...initialGame, visitor_team: "a" }
    const result = await api
      .put(`/api/games/${initialGame.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .send(modifiedGame)
      .expect(400)

    const gamesAtEnd = await helper.gamesInDb()

    const visitor_teams = gamesAtEnd.map(game => game.visitor_team)
    assert(!visitor_teams.includes(modifiedGame.visitor_team))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
    assert(result.body.error.includes(
      'Validation failed: visitor_team: Path `visitor_team` (`a`) is shorter than the minimum allowed length (3).'
    ))

  })

  it('fails with status code 400 if token is missing', async () => {
    const { initialGame } = values

    const modifiedGame = { ...initialGame, visitor_team: 'token missing' }

    const result = await api
      .put(`/api/games/${initialGame.id}`)
      .send(modifiedGame)
      .expect(400)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes(
      'Token missing or invalid'
    ))

    const visitor_teams = gamesAtEnd.map(game => game.visitor_team)
    assert(!visitor_teams.includes(modifiedGame.visitor_team))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)

  })
  it('fails with status code 400 if token is invalid', async () => {
    const { initialGame } = values

  
    const modifiedGame = { ...initialGame, visitor_team: 'invalid token' }

    const invalidToken = 'invalidtoken'

    const result = await api
      .put(`/api/games/${initialGame.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(modifiedGame)
      .expect(400)

    const gamesAtEnd = await helper.gamesInDb()

    assert(result.body.error.includes('Token missing or invalid'))

    const visitor_teams = gamesAtEnd.map(game => game.visitor_team)
    assert(!visitor_teams.includes(modifiedGame.visitor_team))
    assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 1)
  })

  it(
    'succeeds with status code 200 when tournament is changed',
    async () => {

      const { admintoken } = values

      const oldTournament = {
        name: 'oldTournament',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 3))
          .toISOString(),
      }

      const oldtournamentresponse = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(oldTournament)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const newGame = {
        home_team: 'changing',
        visitor_team: 'tournament',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        tournament: oldtournamentresponse.body.id
      }

      const newgameresponse = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newGame)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const newTournament = {
        name: 'newTournament',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 3))
          .toISOString(),
      }

      const newtournamentresponse = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newTournament)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const modifiedGame = { ...newGame, visitor_team: 'modified visitor_team and tournament', tournament: newtournamentresponse.body.id }

      const resultGame = await api
        .put(`/api/games/${newgameresponse.body.id}`)
        .set('Authorization', `Bearer ${admintoken}`)
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
      assert.strictEqual(gamesAtEnd.length, helper.initialGames.length + 2)

      const updatedOldTournament = await api
        .get(`/api/tournaments/${oldtournamentresponse.body.id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const updatedNewTournament = await api
        .get(`/api/tournaments/${newtournamentresponse.body.id}`)
        .set('Authorization', `Bearer ${admintoken}`)
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
  let values

  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('addition fails with valid data', async () => {
    const { usertoken } = values

    const newGame = {
      home_team: 'no',
      visitor_team: 'admin rights',
      date:
      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString()
    }

    const result = await api
      .post('/api/games')
      .set('Authorization', `Bearer ${usertoken}`)
      .send(newGame)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('This operation is for admins only.'))

  })

  it('modification of a game fails with valid data and id', async () => {

    const { usertoken } = values
    const gamesAtStart = await helper.gamesInDb()

    const gameToModify = gamesAtStart[0]

 
    const modifiedGame = { ...gameToModify, visitor_team: 'modified visitor_team' }


    const resultGame = await api
      .put(`/api/games/${gameToModify.id}`)
      .send(modifiedGame)
      .set('Authorization', `Bearer ${usertoken}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(resultGame.body.error.includes('This operation is for admins only.'))

  })

  it('deletion of a game fails with valid id', async () => {
    const gamesAtStart = await helper.gamesInDb()
    const gameToDelete = gamesAtStart[0]
    const { usertoken } = values

    const result = await api
      .delete(`/api/games/${gameToDelete.id}`)
      .set('Authorization', `Bearer ${usertoken}`)
      .expect(400)

    assert(result.body.error.includes('This operation is for admins only.'))


  })
})

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({})
    await Game.deleteMany({})
    await Tournament.deleteMany({})
  }
  await mongoose.connection.close()
})