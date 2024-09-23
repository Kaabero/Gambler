const assert = require('node:assert')
const { test, after, describe, beforeEach, afterEach } = require('node:test')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Bet = require('../models/bet')
const Game = require('../models/game')
const Outcome = require('../models/outcome')
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

const tournamentForBetTesting = {
  name: 'tournamentForBetTesting',
  from_date:
  new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString(),
  to_date:
  new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
}

let admintoken

let usertoken

let gameOneId

let gameTwoId

let gameThreeId

let tournamentId

let adminId

let userId




const insertInitialData = async () => {
  await Bet.deleteMany({})
  await Game.deleteMany({})
  await User.deleteMany({})
  await Tournament.deleteMany({})
  await Outcome.deleteMany({})

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

  await Tournament.insertMany([tournamentForBetTesting])

  const tournaments = await helper.tournamentsInDb()

  tournamentId = tournaments[0].id

  const gameOne = {
    home_team: 'game',
    visitor_team: 'one',
    date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString(),
    tournament: tournamentId
  }

  const gameTwo = {
    home_team: 'game',
    visitor_team: 'two',
    date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString(),
    tournament: tournamentId
  }

  const gameThree = {
    home_team: 'game',
    visitor_team: 'three',
    date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString(),
    tournament: tournamentId
  }


  await Game.insertMany([gameOne, gameTwo, gameThree])

  const games = await helper.gamesInDb()


  gameOneId = games[0].id
  gameTwoId = games[1].id
  gameThreeId = games[2].id


  const betOne = {
    goals_home: '1',
    goals_visitor: '1',
    game: gameOneId,
    user: adminId
  }

  const betTwo = {
    goals_home: '3',
    goals_visitor: '2',
    game: gameTwoId,
    user: adminId
  }

  const betThree = {
    goals_home: '3',
    goals_visitor: '2',
    game: gameThreeId,
    user: adminId
  }

  await Bet.insertMany([betOne, betTwo, betThree])
}



describe('returning initial bets', () => {
  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Bet.deleteMany({})
  })

  test('bets are returned as json', async () => {
    await api
      .get('/api/bets')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all bets are returned', async () => {
    const response = await api.get('/api/bets')
    assert.strictEqual(response.body.length, 3)
  })

  test('a specific bet is within the returned bets', async () => {
    const response = await api.get('/api/bets')

    const games = response.body.map(bet => bet.game)
    const users = response.body.map(bet => bet.user)

    const home_goals = response.body.map(bet => bet.goals_home)
    const visitor_goals = response.body.map(bet => bet.goals_visitor)

    assert.strictEqual(games[0].id, gameOneId)
    assert.strictEqual(users[0].id, adminId)
    assert.strictEqual(home_goals[0], 1)
    assert.strictEqual(visitor_goals[0], 1)
  })
})

describe('viewing a specific bet', () => {
  beforeEach(async () => {
    await insertInitialData()
  })
  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Bet.deleteMany({})
  })

  test('succeeds with a valid id', async () => {
    const betsAtStart = await helper.betsInDb()

    const betToView = betsAtStart[0]

    const resultBet = await api
      .get(`/api/bets/${betToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBet.body.user.id, betToView.user.toString())
    assert.deepStrictEqual(resultBet.body.game.id, betToView.game.toString())
    assert.deepStrictEqual(
      resultBet.body.goals_home, betToView.goals_home
    )
    assert.deepStrictEqual(
      resultBet.body.goals_visitor, betToView.goals_visitor
    )

  })


  test('fails with statuscode 404 if bet does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/bets/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/bets/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new bet', () => {

  beforeEach(async () => {
    await insertInitialData()
  })
  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Bet.deleteMany({})
  })

  test('succeeds with valid data and token', async () => {
    const betsAtStart = await helper.betsInDb()

    const newBet = {
      goals_home: '2',
      goals_visitor: '3',
      game: gameOneId,
      user: userId
    }

    await api
      .post('/api/bets')
      .set('Authorization', `Bearer ${usertoken}`)
      .send(newBet)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const betsAtEnd = await helper.betsInDb()
    assert.strictEqual(betsAtEnd.length, betsAtStart.length + 1)

    const visitor_goals = betsAtEnd.map(bet => bet.goals_visitor)
    assert(visitor_goals.includes(3))
  })
  test(
    'fails with status code 401 and proper message if token is invalid',
    async () => {
      const betsAtStart = await helper.betsInDb()
      const newBet = {
        goals_home: '2',
        goals_visitor: '3',
        game: gameOneId,
        user: userId
      }

      const invalidToken = 'invalidtoken'

      const result = await api
        .post('/api/bets')
        .send(newBet)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const betsAtEnd = await helper.betsInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )

  test(
    'fails with status code 400 if token is missing',
    async () => {
      const betsAtStart = await helper.betsInDb()
      const newBet = {
        goals_home: '2',
        goals_visitor: '3',
        game: gameOneId,
        user: userId
      }


      const result = await api
        .post('/api/bets')
        .send(newBet)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const betsAtEnd = await helper.betsInDb()

      assert(result.body.error.includes('Token missing or invalid'))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )


  test(
    'fails with status code 400 if user already has a bet in the game',
    async () => {
      const betsAtStart = await helper.betsInDb()


      const newBet = {
        goals_home: '2',
        goals_visitor: '3',
        game: gameOneId,
        user: adminId
      }

      const result = await api
        .post('/api/bets')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newBet)

      const betsAtEnd = await helper.betsInDb()

      assert(result.body.error.includes(
        'User has already placed a bet on this game'
      ))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )

  test(
    'fails with status code 400 and proper error message if data invalid',
    async () => {
      const betsAtStart = await helper.betsInDb()

      const newBet = {
        goals_home: '2',
        goals_visitor: '',
        game: gameOneId,
        user: userId
      }

      const result = await api
        .post('/api/bets')
        .set('Authorization', `Bearer ${usertoken}`)
        .send(newBet)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const betsAtEnd = await helper.betsInDb()

      assert.strictEqual(betsAtEnd.length, betsAtStart.length)

      assert(result.body.error.includes(
        'Some of the required fields are missing'
      ))
    }
  )

  test(
    `fails with status code 400 and proper error message 
    if game date is in the past`,
    async () => {
      const betsAtStart = await helper.betsInDb()

      const newBet = {
        goals_home: '2',
        goals_visitor: '2',
        game: gameThreeId,
        user: userId
      }

      const result = await api
        .post('/api/bets')
        .set('Authorization', `Bearer ${usertoken}`)
        .send(newBet)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const betsAtEnd = await helper.betsInDb()

      assert.strictEqual(betsAtEnd.length, betsAtStart.length)

      assert(result.body.error.includes(
        'Bet cannot be added for past games'
      ))
    }
  )

})

describe('deletion of a bet', () => {

  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Bet.deleteMany({})
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const betsAtStart = await helper.betsInDb()
    const betToDelete = betsAtStart[0]

    await api
      .delete(`/api/bets/${betToDelete.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(204)

    const betsAtEnd = await helper.betsInDb()

    const ids = betsAtEnd.map(bet => bet.id)
    assert(!ids.includes(betToDelete.id))

    assert.strictEqual(betsAtEnd.length, betsAtStart.length - 1)
  })

  test(
    'fails with status code 401 if user has no rights to delete this bet',
    async () => {
      const betsAtStart = await helper.betsInDb()
      const betToDelete = betsAtStart[0]

      const result = await api
        .delete(`/api/bets/${betToDelete.id}`)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(401)

      const betsAtEnd = await helper.betsInDb()

      const ids = betsAtEnd.map(bet => bet.id)
      assert(ids.includes(betToDelete.id))

      assert(result.body.error.includes('Authorization failed'))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )

  test('fails with status code 400 if token is missing', async () => {
    const betsAtStart = await helper.betsInDb()
    const betToDelete = betsAtStart[0]

    const result = await api
      .delete(`/api/bets/${betToDelete.id}`)
      .expect(400)

    const betsAtEnd = await helper.betsInDb()

    const ids = betsAtEnd.map(bet => bet.id)
    assert(ids.includes(betToDelete.id))

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(betsAtEnd.length, betsAtStart.length)

  })

  test('fails with status code 400 if token is invalid', async () => {
    const betsAtStart = await helper.betsInDb()
    const betToDelete = betsAtStart[0]

    const invalidToken = 'invalidtoken'

    const result = await api
      .delete(`/api/bets/${betToDelete.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(400)

    const betsAtEnd = await helper.betsInDb()

    const ids = betsAtEnd.map(bet => bet.id)
    assert(ids.includes(betToDelete.id))

    assert(result.body.error.includes('Token missing or invalid'))
    assert.strictEqual(betsAtEnd.length, betsAtStart.length)

  })

  test(
    'fails with status code 400 if game already has an outcome',
    async () => {
      const betsAtStart = await helper.betsInDb()
      const betToDelete = betsAtStart[2]

      const outCome = {
        goals_home: '1',
        goals_visitor: '1',
        game: gameThreeId,
      }

      await api
        .post('/api/outcomes')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(outCome)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const result = await api
        .delete(`/api/bets/${betToDelete.id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .expect(400)

      const betsAtEnd = await helper.betsInDb()

      const ids = betsAtEnd.map(bet => bet.id)
      assert(ids.includes(betToDelete.id))

      assert(result.body.error.includes(
        'Deleting bets is not allowed for games that have already been scored.'
      ))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )
})

describe('modification of a bet', () => {
  beforeEach(async () => {
    await insertInitialData()
  })
  afterEach(async () => {
    await Game.deleteMany({})
    await User.deleteMany({})
    await Tournament.deleteMany({})
    await Outcome.deleteMany({})
    await Bet.deleteMany({})
  })

  test('succeeds with status code 200 with valid data and id', async () => {

    const betsAtStart = await helper.betsInDb()
    const betToModify = betsAtStart[0]

    const modifiedBet = {
      goals_visitor: '6',
    }

    const result = await api
      .put(`/api/bets/${betToModify.id.toString()}`)
      .send(modifiedBet)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const betsAtEnd = await helper.betsInDb()

    assert.deepStrictEqual(result.body.id, betToModify.id.toString())
    assert.deepStrictEqual(
      result.body.goals_home, betToModify.goals_home
    )
    assert.deepStrictEqual(
      result.body.game, betToModify.game.toString()
    )
    assert.notEqual(
      result.body.goals_visitor,
      betToModify.goals_visitor
    )
    assert.strictEqual(betsAtEnd.length, betsAtStart.length)
  })

  test(
    `fails with status code 400 and proper message 
      if game already has an outcome`,
    async () => {

      const betsAtStart = await helper.betsInDb()
      const betToModify = betsAtStart[2]

      const outCome = {
        goals_home: '1',
        goals_visitor: '1',
        game: gameThreeId,
      }

      await api
        .post('/api/outcomes')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(outCome)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const modifiedBet = {
        goals_visitor_team: '10',
      }

      const result = await api
        .put(`/api/bets/${betToModify.id.toString()}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send(modifiedBet)
        .expect(400)

      const betsAtEnd = await helper.betsInDb()


      assert(result.body.error.includes(
        'Editing bets is not allowed for games that have already been scored.'
      ))

      const visitor_goals = betsAtEnd.map(bet => bet.goals_visitor)

      assert(!visitor_goals.includes(modifiedBet.visitor_goals))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )

  test('fails with status code 400 if data is invalid', async () => {

    const betsAtStart = await helper.betsInDb()
    const betToModify = betsAtStart[0]

    const modifiedBet = {
      goals_visitor: 'a',
    }
    await api
      .put(`/api/bets/${betToModify.id.toString()}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .send(modifiedBet)
      .expect(400)

    const betsAtEnd = await helper.betsInDb()

    const visitor_goals = betsAtEnd.map(bet => bet.goals_visitor)
    assert(!visitor_goals.includes(modifiedBet.visitor_goals))
    assert.strictEqual(betsAtEnd.length, betsAtStart.length)

  })

  test('fails with status code 400 if token is missing', async () => {

    const betsAtStart = await helper.betsInDb()
    const betToModify = betsAtStart[0]

    const modifiedBet = {
      goals_visitor: '12',
    }

    const result = await api
      .put(`/api/bets/${betToModify.id.toString()}`)
      .send(modifiedBet)
      .expect(400)

    const betsAtEnd = await helper.betsInDb()

    assert(result.body.error.includes(
      'Token missing or invalid'
    ))

    const visitor_goals = betsAtEnd.map(bet => bet.goals_visitor)
    assert(!visitor_goals.includes(modifiedBet.visitor_goals))
    assert.strictEqual(betsAtEnd.length, betsAtStart.length)

  })
  test('fails with status code 400 if token is invalid', async () => {

    const betsAtStart = await helper.betsInDb()
    const betToModify = betsAtStart[0]

    const modifiedBet = {
      goals_visitor: '12',
    }

    const invalidToken = 'invalidtoken'

    const result = await api
      .put(`/api/bets/${betToModify.id.toString()}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(modifiedBet)
      .expect(400)

    const betsAtEnd = await helper.betsInDb()

    assert(result.body.error.includes(
      'Token missing or invalid'
    ))

    const visitor_goals = betsAtEnd.map(bet => bet.goals_visitor)
    assert(!visitor_goals.includes(modifiedBet.visitor_goals))
    assert.strictEqual(betsAtEnd.length, betsAtStart.length)
  })

  test(
    'fails with status code 401 if user has no rights to edit this bet',
    async () => {

      const betsAtStart = await helper.betsInDb()
      const betToModify = betsAtStart[0]

      const modifiedBet = {
        goals_visitor: '22',
      }

      const result = await api
        .put(`/api/bets/${betToModify.id.toString()}`)
        .send(modifiedBet)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const betsAtEnd = await helper.betsInDb()

      assert(result.body.error.includes('Authorization failed'))

      const visitor_goals = betsAtEnd.map(bet => bet.goals_visitor)
      assert(!visitor_goals.includes(modifiedBet.visitor_goals))
      assert.strictEqual(betsAtEnd.length, betsAtStart.length)
    }
  )

})


after(async () => {
  await Bet.deleteMany({})
  await User.deleteMany({})
  await Game.deleteMany({})
  await Tournament.deleteMany({})
  await Outcome.deleteMany({})
  await mongoose.connection.close()
})

