const assert = require('node:assert')


const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const Tournament = require('../models/tournament')
const User = require('../models/user')

const helper = require('./test_helper')



const insertInitialData = async () => {

  await Tournament.deleteMany({})
  await User.deleteMany({})

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

  const tournamentOne = {
    name: 'tournamentOne',
    from_date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString(),
    to_date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 3))
      .toISOString(),
  }

  const tournamentTwo = {
    name: 'tournamentTwo',
    from_date:
    new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString(),
    to_date:
    new Date(new Date().setFullYear(new Date().getFullYear() + 3))
      .toISOString(),
  }

  await Tournament.insertMany([tournamentOne, tournamentTwo])

  return { usertoken, admintoken }

}


describe('returning initial tournaments', () => {

  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {

    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('tournaments are returned as json', async () => {
    await api
      .get('/api/tournaments')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('all tournaments are returned', async () => {
    const response = await api.get('/api/tournaments')

    assert.strictEqual(response.body.length, 2)
  })

  it('a specific tournament is within the returned tournaments', async () => {
    const response = await api.get('/api/tournaments')

    const names = response.body.map(tournament => tournament.name)

    assert(names[0].includes('tournamentOne'))
  })
})

describe('viewing a specific tournament', () => {

  beforeEach(async () => {
    await insertInitialData()
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with a valid id', async () => {
    const tournamentsAtStart = await helper.tournamentsInDb()

    const tournamentToView = tournamentsAtStart[0]

    const result = await api
      .get(`/api/tournaments/${tournamentToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(result.body, tournamentToView)
  })


  it('fails with statuscode 404 if tournament does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/tournaments/${validNonexistingId}`)
      .expect(404)
  })

  it('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/tournaments/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new tournament', () => {
  let values

  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with valid data and admin rights', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const { admintoken } = values


    const newTournament = {
      name: 'valid data',
      from_date:
      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString(),
      to_date:
      new Date(new Date().setFullYear(new Date().getFullYear() + 4))
        .toISOString(),
    }

    await api
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${admintoken}`)
      .send(newTournament)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const tournamentsAtEnd = await helper.tournamentsInDb()
    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length + 1)

    const names = tournamentsAtEnd.map(t => t.name)
    assert(names.includes('valid data'))
  })

  it(
    'fails with status code 401 and proper message if token is invalid',
    async () => {

      const tournamentsAtStart = await helper.tournamentsInDb()

      const newTournament = {
        name: 'token invalid',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
      }

      const invalidToken = 'invalidtoken'

      const result = await api
        .post('/api/tournaments')
        .send(newTournament)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const tournamentsAtEnd = await helper.tournamentsInDb()

      assert(result.body.error.includes('Token missing or invalid.'))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it(
    'fails with status code 400 if token is missing',
    async () => {
      const tournamentsAtStart = await helper.tournamentsInDb()

      const newTournament = {
        name: 'token missing',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
      }

      const result = await api
        .post('/api/tournaments')
        .send(newTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const tournamentsAtEnd = await helper.tournamentsInDb()

      assert(result.body.error.includes('Token missing or invalid.'))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it('fails with status code 400 if starting date is in the past',
    async () => {
      const tournamentsAtStart = await helper.tournamentsInDb()
      const { admintoken } = values

      const newTournament = {
        name: 'invalid starting date',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() - 2))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
      }

      const result = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const tournamentsAtEnd = await helper.tournamentsInDb()

      assert(result.body.error.includes(
        'Please set a future starting date.'
      ))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it('fails with status code 400 if name already exists',
    async () => {
      const tournamentsAtStart = await helper.tournamentsInDb()
      const { admintoken } = values

      const newTournament = {
        name: 'touRnamentOne',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
      }

      const result = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const tournamentsAtEnd = await helper.tournamentsInDb()

      assert(result.body.error.includes(
        'Please choose a different name.'
      ))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it('fails with status code 400 if tournament from_date  === to_date',
    async () => {

      const tournamentsAtStart = await helper.tournamentsInDb()
      const { admintoken } = values

      const date =
      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString()

      const newTournament = {
        name: 'invalid dates',
        from_date: date,
        to_date: date
      }


      const result = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)



      const tournamentsAtEnd = await helper.tournamentsInDb()

      assert(result.body.error.includes(
        'The start and end dates cannot be the same.'
      ))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it(
    'fails with status code 400 and proper error message if data invalid',
    async () => {

      const tournamentsAtStart = await helper.tournamentsInDb()
      const { admintoken } = values

      const newTournament = {
        name: '',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
      }

      const result = await api
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${admintoken}`)
        .send(newTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)


      const tournamentsAtEnd = await helper.tournamentsInDb()

      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)

      assert(result.body.error.includes(
        'Some required fields are missing.'
      ))
    }
  )

  it('fails with status code 400 if from_date > to_date', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const { admintoken } = values

    const newTournament = {
      name: 'invalid dates',
      from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
      to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
    }

    const result = await api
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${admintoken}`)
      .send(newTournament)
      .expect(400)
      .expect('Content-Type', /application\/json/)


    const tournamentsAtEnd = await helper.tournamentsInDb()

    assert(result.body.error.includes(
      'The end date must be after the start date.'
    ))

    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
  })
})

describe('deletion of a tournament', () => {
  let values


  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with status code 204 if id is valid', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToDelete = tournamentsAtStart[0]
    const { admintoken } = values

    await api
      .delete(`/api/tournaments/${tournamentToDelete.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(204)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    const ids = tournamentsAtEnd.map(tournament => tournament.id)
    assert(!ids.includes(tournamentToDelete.id))

    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length -1)
  })

  it('fails with status code 400 if token is missing', async () => {
    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToDelete = tournamentsAtStart[0]

    const result = await api
      .delete(`/api/tournaments/${tournamentToDelete.id}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    assert(result.body.error.includes('Token missing or invalid.'))
    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)

  })

  it('fails with status code 400 if token is invalid', async () => {
    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToDelete = tournamentsAtStart[0]

    const invalidToken = 'invalidtoken'

    const result = await api
      .delete(`/api/tournaments/${tournamentToDelete.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    assert(result.body.error.includes('Token missing or invalid.'))
    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)

  })
})

describe('modification of a tournament', () => {
  let values

  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('succeeds with status code 200 with valid data and id', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToModify = tournamentsAtStart[0]
    const { admintoken } = values

    const modifiedTournament = {
      name: 'modified tournament',
    }

    const result = await api
      .put(`/api/tournaments/${tournamentToModify.id.toString()}`)
      .send(modifiedTournament)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    assert.deepStrictEqual(result.body.id, tournamentToModify.id.toString())

    assert.deepStrictEqual(
      result.body.to_date, tournamentToModify.to_date
    )
    assert.deepStrictEqual(
      result.body.from_date, tournamentToModify.from_date
    )
    assert.notEqual(
      result.body.name, tournamentToModify.name
    )

    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
  })

  it(
    `fails with status code 400 and proper message 
    if tournament name already exists`,
    async () => {

      const tournamentsAtStart = await helper.tournamentsInDb()
      const tournamentToModify = tournamentsAtStart[1]
      const { admintoken } = values

      const modifiedTournament = {
        name: 'TOURnamentone',
      }

      const result = await api
        .put(`/api/tournaments/${tournamentToModify.id.toString()}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send(modifiedTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const tournamentsAtEnd = await helper.tournamentsInDb()


      assert(result.body.error.includes(
        'Please choose a different name.'
      ))
      const names = tournamentsAtEnd.map(t => t.names)
      assert(!names.includes(modifiedTournament.name))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it(
    `fails with status code 400 and proper message 
    if from_date>to_date`,
    async () => {

      const tournamentsAtStart = await helper.tournamentsInDb()
      const tournamentToModify = tournamentsAtStart[1]
      const { admintoken } = values

      const modifiedTournament = {
        name: 'modified tournament',
        from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
        to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
      }

      const result = await api
        .put(`/api/tournaments/${tournamentToModify.id.toString()}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send(modifiedTournament)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const tournamentsAtEnd = await helper.tournamentsInDb()


      assert(result.body.error.includes(
        'The end date must be after the start date.'
      ))
      const names = tournamentsAtEnd.map(t => t.names)
      assert(!names.includes(modifiedTournament.name))
      assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
    }
  )

  it('fails with status code 400 if data is invalid', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToModify = tournamentsAtStart[0]
    const { admintoken } = values

    const modifiedTournament = {
      name: 1,
    }

    await api
      .put(`/api/tournaments/${tournamentToModify.id.toString()}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .send(modifiedTournament)
      .expect(400)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    const names = tournamentsAtEnd.map(t => t.names)
    assert(!names.includes(modifiedTournament.name))
    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)

  })

  it('fails with status code 400 if token is missing', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToModify = tournamentsAtStart[0]

    const modifiedTournament = {
      name: 'modified tournament',
    }

    const result = await api
      .put(`/api/tournaments/${tournamentToModify.id.toString()}`)
      .send(modifiedTournament)
      .expect(400)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    assert(result.body.error.includes(
      'Token missing or invalid.'
    ))

    const names = tournamentsAtEnd.map(t => t.names)
    assert(!names.includes(modifiedTournament.name))
    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)

  })
  it('fails with status code 400 if token is invalid', async () => {

    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToModify = tournamentsAtStart[0]

    const modifiedTournament = {
      name: 'modified tournament',
    }

    const invalidToken = 'invalidtoken'

    const result = await api
      .put(`/api/tournaments/${tournamentToModify.id.toString()}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(modifiedTournament)
      .expect(400)

    const tournamentsAtEnd = await helper.tournamentsInDb()

    assert(result.body.error.includes('Token missing or invalid.'))

    const names = tournamentsAtEnd.map(t => t.names)
    assert(!names.includes(modifiedTournament.name))
    assert.strictEqual(tournamentsAtEnd.length, tournamentsAtStart.length)
  })

})

describe('operations without admin rights: ', () => {
  let values


  beforeEach(async () => {
    values = await insertInitialData()
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Tournament.deleteMany({})
  })

  it('addition fails with valid data', async () => {
    const { usertoken } = values

    const newTournament = {
      name: 'no admin rights',
      from_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 2))
          .toISOString(),
      to_date:
        new Date(new Date().setFullYear(new Date().getFullYear() + 4))
          .toISOString(),
    }

    const result = await api
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${usertoken}`)
      .send(newTournament)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('This operation is for admins only.'))

  })

  it(
    'modification of a tournament fails with valid data and id',
    async () => {
      const { usertoken } = values

      const tournamentsAtStart = await helper.tournamentsInDb()

      const tournamentToModify = tournamentsAtStart[0]

      const modifiedTournament = {
        name: 'modified name',
      }

      const result = await api
        .put(`/api/tournaments/${tournamentToModify.id}`)
        .send(modifiedTournament)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('This operation is for admins only.'))

    }
  )

  it('deletion of a tournament fails with valid id', async () => {
    const tournamentsAtStart = await helper.tournamentsInDb()
    const tournamentToDelete = tournamentsAtStart[0]
    const { usertoken } = values


    const result = await api
      .delete(`/api/tournaments/${tournamentToDelete.id}`)
      .set('Authorization', `Bearer ${usertoken}`)
      .expect(400)

    assert(result.body.error.includes('This operation is for admins only.'))


  })
})

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({})
    await Tournament.deleteMany({})
  }
  await mongoose.connection.close()
})