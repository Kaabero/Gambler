const assert = require('node:assert')


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




const insertInitialData = async () => {
  await Game.deleteMany({})
  await User.deleteMany({})
  await Tournament.deleteMany({})
  await Outcome.deleteMany({})
  await Scores.deleteMany({})

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

  const adminId = adminloginresponse.body.id

  const userId = userloginresponse.body.id


  await Tournament.insertMany([tournamentForScoresTesting])

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

  await Game.insertMany([gameOne, gameTwo])

  const games = await helper.gamesInDb()


  const gameOneId = games[0].id
  const gameTwoId = games[1].id

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


  const outcomeOneId = outcomes[0].id
  const outcomeTwoId = outcomes[1].id

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

  return {
    admintoken,
    usertoken,
    gameOneId,
    gameTwoId,
    outcomeOneId,
    outcomeTwoId,
    tournamentId,
    adminId,
    userId
  }
}



describe('returning initial scores', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  it('scores are returned as json', async () => {
    await api
      .get('/api/scores')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('all scores are returned', async () => {
    const response = await api.get('/api/scores')
    assert.strictEqual(response.body.length, 2)
  })

  it('a specific score is within the returned scores', async () => {
    const response = await api.get('/api/scores')
    const { outcomeOneId, adminId } = values

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

  it('succeeds with a valid id', async () => {
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


  it('fails with statuscode 404 if score does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/scores/${validNonexistingId}`)
      .expect(404)
  })

  it('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/scores/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new scores', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  it('succeeds with valid data and token', async () => {
    const scoresAtStart = await helper.scoresInDb()
    const { admintoken, outcomeTwoId, userId } = values

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

  it('fails with status code 400 without admin rights', async () => {
    const scoresAtStart = await helper.scoresInDb()
    const { usertoken, outcomeTwoId, adminId } = values

    const newScores = {
      points: '3',
      outcome: outcomeTwoId,
      user: adminId
    }

    const result = await api
      .post('/api/scores')
      .set('Authorization', `Bearer ${usertoken}`)
      .send(newScores)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const scoresAtEnd = await helper.scoresInDb()

    assert(result.body.error.includes('This operation is for admins only.'))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
  })

  it(
    'fails with status code 401 and proper message if token is invalid',
    async () => {
      const scoresAtStart = await helper.scoresInDb()
      const { outcomeTwoId, userId } = values

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

      assert(result.body.error.includes('Token missing or invalid.'))
      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
    }
  )

  it(
    'fails with status code 400 if token is missing',
    async () => {
      const scoresAtStart = await helper.scoresInDb()
      const { outcomeTwoId, userId } = values

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

      assert(result.body.error.includes('Token missing or invalid.'))
      assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
    }
  )


  it(
    'fails with status code 400 and proper error message if data invalid',
    async () => {
      const scoresAtStart = await helper.scoresInDb()
      const { admintoken, outcomeTwoId, userId } = values

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
        'Some required fields are missing.'
      ))
    }
  )

  it(
    `fails with status code 400 and proper error message 
    if user has already scores for this outcome`,
    async () => {
      const scoresAtStart = await helper.scoresInDb()
      const { admintoken, adminId, outcomeOneId } = values

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
        'User has already received points for this game.'
      ))
    }
  )

})


describe('modification of a score', () => {
  let values
  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  })

  it('succeeds with status code 200 with valid data and id', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]
    const { admintoken } = values

    const modifiedScores = {
      points: '10'
    }

    const result = await api
      .put(`/api/scores/${scoreToModify.id.toString()}`)
      .send(modifiedScores)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const scoresAtEnd = await helper.scoresInDb()

    assert.deepStrictEqual(
      result.body.outcome, scoreToModify.outcome.toString()
    )
    assert.deepStrictEqual(
      result.body.user, scoreToModify.user.toString()
    )

    assert.deepStrictEqual(result.body.id, scoreToModify.id.toString())


    assert.notEqual(
      result.body.points, scoreToModify.points
    )
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
  })

  it('succeeds with status code 400 without admin rights', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]
    const { usertoken } = values

    const modifiedScores = {
      points: '11'
    }

    const result = await api
      .put(`/api/scores/${scoreToModify.id.toString()}`)
      .send(modifiedScores)
      .set('Authorization', `Bearer ${usertoken}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const scoresAtEnd = await helper.scoresInDb()

    assert(result.body.error.includes(
      'This operation is for admins only.'
    ))


    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
  })


  it('fails with status code 400 if data is invalid', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]
    const { admintoken } = values

    const modifiedScores = {
      points: 'a'
    }
    await api
      .put(`/api/scores/${scoreToModify.id.toString()}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .send(modifiedScores)
      .expect(400)

    const scoresAtEnd = await helper.scoresInDb()

    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)

  })

  it('fails with status code 400 if token is missing', async () => {

    const scoresAtStart = await helper.scoresInDb()
    const scoreToModify = scoresAtStart[0]

    const modifiedScores = {
      points: '20'
    }

    const result = await api
      .put(`/api/scores/${scoreToModify.id.toString()}`)
      .send(modifiedScores)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const scoresAtEnd = await helper.scoresInDb()

    assert(result.body.error.includes(
      'Token missing or invalid.'
    ))

    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)

  })
  it('fails with status code 400 if token is invalid', async () => {
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

    assert(result.body.error.includes('Token missing or invalid.'))

    const points = scoresAtEnd.map(s => s.points)
    assert(!points.includes(modifiedScores.points))
    assert.strictEqual(scoresAtEnd.length, scoresAtStart.length)
  })

})

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({})
    await Game.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Scores.deleteMany({})
  }
  await mongoose.connection.close()
})