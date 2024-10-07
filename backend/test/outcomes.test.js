const assert = require('node:assert')


const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Game = require('../models/game')
const Outcome = require('../models/outcome')
const Tournament = require('../models/tournament')
const User = require('../models/user')


const helper = require('./test_helper')



const insertInitialData = async () => {
  await Game.deleteMany({})
  await User.deleteMany({})
  await Tournament.deleteMany({})
  await Outcome.deleteMany({})

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

  const tournamentForOutcomeTesting = {
    name: 'tournamentForOutcomeTesting',
    from_date: '1.1.2024',
    to_date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 2))
      .toISOString(),
  }


  await api
    .post('/api/users')
    .send(testAdmin)

  const adminloginresponse = await api
    .post('/api/login')
    .send(testAdmin)

  await api
    .post('/api/users')
    .send(testUser)

  const userloginresponse = await api
    .post('/api/login')
    .send(testUser)


  const admintoken = adminloginresponse.body.token

  const usertoken = userloginresponse.body.token

  await Tournament.insertMany([tournamentForOutcomeTesting])

  const tournaments = await helper.tournamentsInDb()

  const tournamentId = tournaments[0].id

  const gameOne = {
    home_team: 'game',
    visitor_team: 'one',
    date: '1.2.2024',
    tournament: tournamentId
  }

  const gameTwo = {
    home_team: 'game',
    visitor_team: 'two',
    date: '1.2.2024',
    tournament: tournamentId
  }

  const gameThree = {
    home_team: 'game',
    visitor_team: 'three',
    date: '1.2.2024',
    tournament: tournamentId
  }

  await Game.insertMany([gameOne, gameTwo, gameThree])

  const games = await helper.gamesInDb()


  const gameOneId = games[0].id
  const gameTwoId = games[1].id
  const gameThreeId = games[2].id

  const outcomeOne = {
    goals_home: '1',
    goals_visitor: '1',
    game: gameOneId,
  }

  const outcometTwo = {
    goals_home: '3',
    goals_visitor: '2',
    game: gameTwoId,
  }

  await Outcome.insertMany([outcomeOne, outcometTwo])

  return {
    admintoken, usertoken, gameOneId, gameTwoId, gameThreeId, tournamentId
  }
}



describe('returning initial outcomes', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
  })

  it('outcomes are returned as json', async () => {
    await api
      .get('/api/outcomes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('all outcomes are returned', async () => {
    const response = await api.get('/api/outcomes')
    assert.strictEqual(response.body.length, 2)
  })

  it('a specific outcome is within the returned outcomes', async () => {
    const response = await api.get('/api/outcomes')
    const { gameOneId } = values

    const games = response.body.map(outcome => outcome.game)

    const home_goals = response.body.map(outcome => outcome.goals_home)
    const visitor_goals = response.body.map(outcome => outcome.goals_visitor)

    assert.strictEqual(games[0].id, gameOneId)
    assert.strictEqual(home_goals[0], 1)
    assert.strictEqual(visitor_goals[0], 1)
  })
})

describe('viewing a specific outcome', () => {
  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
  })

  it('succeeds with a valid id', async () => {
    const outcomesAtStart = await helper.outcomesInDb()

    const outcomeToView = outcomesAtStart[0]

    const result = await api
      .get(`/api/outcomes/${outcomeToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(result.body.game.id, outcomeToView.game.toString())
    assert.deepStrictEqual(
      result.body.goals_home, outcomeToView.goals_home
    )
    assert.deepStrictEqual(
      result.body.goals_visitor, outcomeToView.goals_visitor
    )

  })


  it('fails with statuscode 404 if outcome does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/outcomes/${validNonexistingId}`)
      .expect(404)
  })

  it('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/outcomes/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new outcome', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
  })

  it('succeeds with valid data and token', async () => {
    const outcomesAtStart = await helper.outcomesInDb()
    const { gameThreeId, admintoken } = values

    const newOutcome = {
      goals_home: '2',
      goals_visitor: '3',
      game: gameThreeId,
    }

    await api
      .post('/api/outcomes')
      .set('Authorization', `Bearer ${admintoken}`)
      .send(newOutcome)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const outcomesAtEnd = await helper.outcomesInDb()
    assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length + 1)

    const visitor_goals = outcomesAtEnd.map(outcome => outcome.goals_visitor)
    assert(visitor_goals.includes(3))
  })

  it('fails with status code 400 without admin rights', async () => {
    const outcomesAtStart = await helper.outcomesInDb()
    const { gameThreeId, usertoken } = values

    const newOutcome = {
      goals_home: '2',
      goals_visitor: '3',
      game: gameThreeId,
    }

    const result = await api
      .post('/api/outcomes')
      .set('Authorization', `Bearer ${usertoken}`)
      .send(newOutcome)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const outcomesAtEnd = await helper.outcomesInDb()

    assert(result.body.error.includes('This operation is for admins only.'))
    assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)
  })

  it(
    'fails with status code 401 and proper message if token is invalid',
    async () => {
      const outcomesAtStart = await helper.outcomesInDb()
      const { gameThreeId } = values
      const newOutcome = {
        goals_home: '2',
        goals_visitor: '3',
        game: gameThreeId,
      }

      const invalidToken = 'invalidtoken'

      const result = await api
        .post('/api/outcomes')
        .send(newOutcome)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const outcomesAtEnd = await helper.outcomesInDb()

      assert(result.body.error.includes('Token missing or invalid.'))
      assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)
    }
  )

  it(
    'fails with status code 400 if token is missing',
    async () => {
      const outcomesAtStart = await helper.outcomesInDb()
      const { gameThreeId } = values

      const newOutcome = {
        goals_home: '2',
        goals_visitor: '3',
        game: gameThreeId,
      }


      const result = await api
        .post('/api/outcomes')
        .send(newOutcome)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const outcomesAtEnd = await helper.outcomesInDb()

      assert(result.body.error.includes('Token missing or invalid.'))
      assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)
    }
  )


  it(
    'fails with status code 400 and proper error message if data invalid',
    async () => {
      const outcomesAtStart = await helper.outcomesInDb()
      const { gameThreeId, admintoken } = values

      const newOutcome = {
        goals_home: '2',
        goals_visitor: '',
        game: gameThreeId,
      }

      const result = await api
        .post('/api/outcomes')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newOutcome)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const outcomesAtEnd = await helper.outcomesInDb()

      assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)

      assert(result.body.error.includes(
        'Some required fields are missing.'
      ))
    }
  )

  it(
    `fails with status code 400 and proper error message 
    if game date is in the future`,
    async () => {
      const outcomesAtStart = await helper.outcomesInDb()
      const { tournamentId, admintoken } = values

      const gameInFuture = {
        home_team: 'past',
        visitor_team: 'game',
        date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString(),
        tournament: tournamentId
      }

      const gameresponse = await api
        .post('/api/games')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(gameInFuture)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const newOutcome = {
        goals_home: '2',
        goals_visitor: '2',
        game: gameresponse.body.id,
      }

      const result = await api
        .post('/api/outcomes')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newOutcome)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const outcomesAtEnd = await helper.outcomesInDb()

      assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)

      assert(result.body.error.includes(
        'Game result cannot be added for future games.'
      ))
    }
  )

})

describe('deletion of a outcome', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
  })

  it('succeeds with status code 204 if id is valid', async () => {
    const outcomesAtStart = await helper.outcomesInDb()
    const outcomeToDelete = outcomesAtStart[0]
    const { admintoken } = values

    await api
      .delete(`/api/outcomes/${outcomeToDelete.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(204)

    const outcomesAtEnd = await helper.outcomesInDb()

    const ids = outcomesAtEnd.map(outcome => outcome.id)
    assert(!ids.includes(outcomeToDelete.id))

    assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length - 1)
  })

  it(
    'fails with status code 401 if user has no rights to delete this outcome',
    async () => {
      const outcomesAtStart = await helper.outcomesInDb()
      const outcomeToDelete = outcomesAtStart[0]
      const { usertoken } = values

      const result = await api
        .delete(`/api/outcomes/${outcomeToDelete.id}`)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(400)

      const outcomesAtEnd = await helper.outcomesInDb()

      const ids = outcomesAtEnd.map(outcome => outcome.id)
      assert(ids.includes(outcomeToDelete.id))

      assert(result.body.error.includes('This operation is for admins only.'))
      assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)
    }
  )

  it('fails with status code 400 if token is missing', async () => {
    const outcomesAtStart = await helper.outcomesInDb()
    const outcomeToDelete = outcomesAtStart[0]

    const result = await api
      .delete(`/api/outcomes/${outcomeToDelete.id}`)
      .expect(400)

    const outcomesAtEnd = await helper.outcomesInDb()

    const ids = outcomesAtEnd.map(outcome => outcome.id)
    assert(ids.includes(outcomeToDelete.id))

    assert(result.body.error.includes('Token missing or invalid.'))
    assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)

  })

  it('fails with status code 400 if token is invalid', async () => {
    const outcomesAtStart = await helper.outcomesInDb()
    const outcomeToDelete = outcomesAtStart[0]

    const invalidToken = 'invalidtoken'

    const result = await api
      .delete(`/api/outcomes/${outcomeToDelete.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(400)

    const outcomesAtEnd = await helper.outcomesInDb()

    const ids = outcomesAtEnd.map(outcome => outcome.id)
    assert(ids.includes(outcomeToDelete.id))

    assert(result.body.error.includes('Token missing or invalid.'))
    assert.strictEqual(outcomesAtEnd.length, outcomesAtStart.length)

  })

})


after(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({})
    await Game.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
  }
  await mongoose.connection.close()
})
