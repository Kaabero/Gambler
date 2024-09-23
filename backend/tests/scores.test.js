const assert = require('node:assert')
const { test, after, describe, beforeEach, afterEach } = require('node:test')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Game = require('../models/game')
const Outcome = require('../models/outcome')
const Scores = require('../models/scores')
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

const tournamentForScoresTesting = {
  name: 'tournamentForScoresTesting',
  from_date: '1.1.2024',
  to_date:
  new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
}

let admintoken

let usertoken

let gameOneId

let gameTwoId

let outcomeOneId

let outcomeTwoId

let tournamentId

let adminId

let userId



const insertInitialData = async () => {
  await Game.deleteMany({})
  await User.deleteMany({})
  await Tournament.deleteMany({})
  await Outcome.deleteMany({})
  await Scores.deleteMany({})

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


  admintoken = adminloginresponse.body.token

  usertoken = userloginresponse.body.token

  adminId = adminloginresponse.body.id

  userId = userloginresponse.body.id


  await Tournament.insertMany([tournamentForScoresTesting])

  const tournaments = await helper.tournamentsInDb()

  tournamentId = tournaments[0].id

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

  await Game.insertMany([gameOne, gameTwo])

  const games = await helper.gamesInDb()


  gameOneId = games[0].id
  gameTwoId = games[1].id

  const outcomeOne = {
    goals_home: '1',
    goals_visitor: '1',
    game: gameOneId,
  }

  const outcomeTwo = {
    goals_home: '3',
    goals_visitor: '2',
    game: gameTwoId,
  }

  await Outcome.insertMany([outcomeOne, outcomeTwo])

  const outcomes = await helper.outcomesInDb()


  outcomeOneId = outcomes[0].id
  outcomeTwoId = outcomes[1].id

  const ScoresOne = {
    points: '1',
    user: adminId,
    outcome: outcomeOneId
  }

  const ScoresTwo = {
    points: '2',
    user: userId,
    outcome: outcomeOneId
  }

  await Scores.insertMany([ScoresOne, ScoresTwo])
}



describe('returning initial scores', () => {
  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  test('scores are returned as json', async () => {
    await api
      .get('/api/scores')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all scores are returned', async () => {
    const response = await api.get('/api/scores')
    assert.strictEqual(response.body.length, 2)
  })

  test('a specific score is within the returned scores', async () => {
    const response = await api.get('/api/scores')

    const points = response.body.map(score => score.points)

    const outcomes = response.body.map(score => score.outcome)
    const users = response.body.map(score => score.user)

    assert.strictEqual(points[0], 1)
    assert.strictEqual(outcomes[0].id, outcomeOneId)
    assert.strictEqual(users[0].id, adminId)
  })
})

describe('viewing a specific scores', () => {
  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  test('succeeds with a valid id', async () => {
    const scoresAtStart = await helper.scoresInDb()

    const scoreToView = scoresAtStart[0]

    const result = await api
      .get(`/api/scores/${scoreToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(
      result.body.outcome.id, scoreToView.outcome.toString()
    )
    assert.deepStrictEqual(
      result.body.points, scoreToView.points
    )
    assert.deepStrictEqual(
      result.body.user.id, scoreToView.user.toString()
    )

  })


  test('fails with statuscode 404 if score does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/scores/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/scores/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new scores', () => {

  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  test('succeeds with valid data and token', async () => {
    const scoresAtStart = await helper.scoresInDb()

    const newScores = {
      points: '3',
      outcome: outcomeTwoId,
      user: userId
    }

    await api
      .post('/api/scores')
      .set('Authorization', `Bearer ${admintoken}`)
      .send(newScores)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const scoresAtEnd = await helper.scoresInDb()
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length + 1)

    const points = scoresAtEnd.map(score => score.points)
    assert(points.includes(3))
  })

  test('fails with status code 400 without admin rights', async () => {
    const scoresAtStart = await helper.scoresInDb()

    const newScores = {
      points: '3',
      outcome: outcomeTwoId,
      user: adminId
    }

    const result = await api
      .post('/api/scoress')
      .set('Authorization', `Bearer ${usertoken}`)
      .send(newScores)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const scoresAtEnd = await helper.scoresInDb()

    assert(result.body.error.includes('This operation is for admins only.'))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
  })

  test(
    'fails with status code 401 and proper message if token is invalid',
    async () => {
      const scoresAtStart = await helper.scoresInDb()

      const newScores = {
        points: '3',
        outcome: outcomeTwoId,
        user: userId
      }

      const invalidToken = 'invalidtoken'

      const result = await api
        .post('/api/scores')
        .send(newScores)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const scoresAtEnd = await helper.scoresInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
    }
  )

  test(
    'fails with status code 400 if token is missing',
    async () => {
      const scoresAtStart = await helper.scoresInDb()

      const newScores = {
        points: '3',
        outcome: outcomeTwoId,
        user: userId
      }

      const result = await api
        .post('/api/scores')
        .send(newScores)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const scoresAtEnd = await helper.scoresInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
    }
  )


  test(
    'fails with status code 400 and proper error message if data invalid',
    async () => {
      const scoresAtStart = await helper.scoresInDb()

      const newScores = {
        points: '',
        outcome: outcomeTwoId,
        user: userId
      }

      const result = await api
        .post('/api/scores')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newScores)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const scoresAtEnd = await helper.scoresInDb()

      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
      assert(result.body.error.includes(
        'Some of the required fields are missing'
      ))
    }
  )

  test(
    `fails with status code 400 and proper error message 
    if user has already scores for this outcome`,
    async () => {
      const scoresAtStart = await helper.scoresInDb()

      const newScores = {
        points: '7',
        outcome: outcomeOneId,
        user: adminId
      }


      const result = await api
        .post('/api/scores')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newScores)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const scoresAtEnd = await helper.scoresInDb()

      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)

      assert(result.body.error.includes(
        'User has already received points for this outcome'
      ))
    }
  )

})

describe('deletion of a score', () => {

  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const scoresAtStart = await helper.scoresInDb()
    const scoreToDelete = scoresAtStart[0]

    await api
      .delete(`/api/scores/${scoreToDelete.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(204)

    const scoresAtEnd = await helper.scoresInDb()

    const ids = scoresAtEnd.map(score => score.id)
    assert(!ids.includes(scoreToDelete.id))

    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length - 1)
  })

  test(
    'fails with status code 401 if user has no rights to delete scores',
    async () => {
      const scoresAtStart = await helper.scoresInDb()
      const scoreToDelete = scoresAtStart[0]

      const result = await api
        .delete(`/api/scores/${scoreToDelete.id}`)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(400)

      const scoresAtEnd = await helper.scoresInDb()

      const ids = scoresAtEnd.map(score => score.id)
      assert(ids.includes(scoreToDelete.id))

      assert(result.body.error.includes('This operation is for admins only.'))
      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
    }
  )

  test('fails with status code 400 if token is missing', async () => {
    const scoresAtStart = await helper.scoresInDb()
    const scoreToDelete = scoresAtStart[0]

    const result = await api
      .delete(`/api/scores/${scoreToDelete.id}`)
      .expect(400)

    const scoresAtEnd = await helper.scoresInDb()

    const ids = scoresAtEnd.map(score => score.id)
    assert(ids.includes(scoreToDelete.id))

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)

  })

  test('fails with status code 400 if token is invalid', async () => {
    const scoresAtStart = await helper.scoresInDb()
    const scoreToDelete = scoresAtStart[0]

    const invalidToken = 'invalidtoken'

    const result = await api
      .delete(`/api/scores/${scoreToDelete.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(400)

    const scoresAtEnd = await helper.scoresInDb()

    const ids = scoresAtEnd.map(score => score.id)
    assert(ids.includes(scoreToDelete.id))

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)

  })

})


describe('modification of a score', () => {
  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  test('succeeds with status code 200 with valid data and id', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]

    const modifiedScores = {
      points: '10'
    }

    const result = await api
      .put(`/api/scores/${scoreToModify.id}`)
      .send(modifiedScores)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const scoresAtEnd = await helper.scoresInDb()

    assert.deepStrictEqual(
      result.body.outcome.id, scoreToModify.outcome.toString()
    )
    assert.deepStrictEqual(
      result.body.user.id, scoreToModify.user.toString()
    )

    assert.deepStrictEqual(result.body.id, scoreToModify.id)


    assert.notEqual(
      result.body.points, scoreToModify.points
    )
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
  })


  test('fails with status code 400 if data is invalid', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]

    const modifiedScores = {
      points: 'a'
    }
    await api
      .put(`/api/scores/${scoreToModify.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .send(modifiedScores)
      .expect(400)

    const scoresAtEnd = await helper.scoresInDb()

    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart)

  })

  test('fails with status code 400 if token is missing', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]

    const modifiedScores = {
      points: '20'
    }

    const result = await api
      .put(`/api/scores/${scoreToModify.id}`)
      .send(modifiedScores)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const scoresAtEnd = await helper.scoresInDb()

    assert(result.body.error.includes(
      'Token missing or invalid'
    ))

    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart)

  })
  test('fails with status code 400 if token is invalid', async () => {
    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]

    const modifiedScores = {
      points: '20'
    }

    const invalidToken = 'invalidtoken'


    const result = await api
      .put(`/api/scores/${scoreToModify.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(modifiedScores)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const scoresAtEnd = await helper.scoresInDb()

    assert(result.body.error.includes('Token missing or invalid'))

    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart)
  })

})

after(async () => {
  await User.deleteMany({})
  await Game.deleteMany({})
  await Tournament.deleteMany({})
  await Outcome.deleteMany({})
  await Scores.deleteMany({})
  await mongoose.connection.close()
})