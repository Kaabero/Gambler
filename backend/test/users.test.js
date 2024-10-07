const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

const helper = require('./test_helper')





describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'FreshUsername',
      password: 'Password1!',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  it(
    `creation fails with proper statuscode and message 
    if username already taken`,
    async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        password: 'Password1!',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('Username already taken.'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    }
  )


  it(
    `login fails with invalid username or password`,
    async () => {
      const usersAtStart = await helper.usersInDb()

      const loginUser = {
        username: 'FreshUsername',
        password: 'Password2!',
      }
  

      const result = await api
        .post('/api/login')
        .send(loginUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes(
        `Invalid username or password.`
      ))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

  it(
    `creation fails with proper statuscode and message 
    if password validation fails`,
    async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'PasswordValidation',
        password: 'password',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes(
        `Password must be at least 8 characters long and include an uppercase 
      letter, a lowercase letter, a number, and a special character.`
      ))
  
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

describe('returning initial users', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const userOne = new User({ username: 'userOne', passwordHash })
    const userTwo = new User({ username: 'userTwo', passwordHash })

    await userOne.save()
    await userTwo.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it('users are returned as json', async () => {

    
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('all users are returned', async () => {
    const response = await api.get('/api/users')
    const usersAtStart = await helper.usersInDb()

    assert.strictEqual(response.body.length, usersAtStart.length)
  })

  it('a specific user is within the returned users', async () => {
    const response = await api.get('/api/users')

    const names = response.body.map(user => user.username)

    assert(names[0].includes('userOne'))
  })
})

describe('viewing a specific user', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const userOne = new User({ username: 'userOne', passwordHash })
    const userTwo = new User({ username: 'userTwo', passwordHash })

    await userOne.save()
    await userTwo.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it('succeeds with a valid id', async () => {
    const usersAtStart = await helper.usersInDb()

    const userToView = usersAtStart[0]

    const result = await api
      .get(`/api/users/${userToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(result.body, userToView)
  })


  it('fails with statuscode 404 if user does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/users/${validNonexistingId}`)
      .expect(404)
  })

  it('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/users/${invalidId}`)
      .expect(400)
  })
})

describe('deletion of a user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const admin = new User({ username: 'adminUser', passwordHash })
    const user = new User({ username: 'user', passwordHash })

    await admin.save()
    await user.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it('succeeds with status code 204 if id is valid', async () => {

    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart[1]

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
  
    const admintoken = adminresponse.body.token
   

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(204)

    const usersAtEnd = await helper.usersInDb()

    const ids = usersAtEnd.map(user => user.id)
    assert(!ids.includes(userToDelete.id))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  it('fails with status code 400 if token is missing', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart[0]

    const result = await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('Token missing or invalid.'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })

  it('fails with status code 400 if token is invalid', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart[0]

    const invalidToken = 'invalidtoken'

    const result = await api
      .delete(`/api/users/${userToDelete.id}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('Token missing or invalid.'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })
})


describe('modification of a user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const admin = new User({ username: 'adminUser', passwordHash, admin: true })
    const user = new User({ username: 'user', passwordHash, admin: false })

    await admin.save()
    await user.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it('succeeds with status code 200 with valid data and id', async () => {

    const usersAtStart = await helper.usersInDb()
    const userToModify = usersAtStart[1]

    const modifiedUser = {
      admin: true,
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
  
    const admintoken = adminresponse.body.token

    const result = await api
      .put(`/api/users/${userToModify.id.toString()}`)
      .send(modifiedUser)
      .set('Authorization', `Bearer ${admintoken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert.deepStrictEqual(result.body.id, userToModify.id.toString())

    assert.deepStrictEqual(
      result.body.username, userToModify.username
    )
    assert.notEqual(
      result.body.admin, userToModify.admin
    )

    assert.strictEqual(usersAtEnd.length, usersAtStart.length +1)
  })

  it(
    `fails with status code 400 and proper message 
    if username is admin`,
    async () => {

    

    const testAdmin = {
      username: 'admin',
      password: 'Password1!',
      admin: true
    }
  
    await api
      .post('/api/users')
      .send(testAdmin)
    const adminresponse = await api
      .post('/api/login')
      .send(testAdmin)
  
    const admintoken = adminresponse.body.token

    const usersAtStart = await helper.usersInDb()
    const userToModify = usersAtStart[2]
    
    const modifiedUser = {
      admin: false,
    }

    const result = await api
      .put(`/api/users/${userToModify.id.toString()}`)
      .set('Authorization', `Bearer ${admintoken}`)
      .send(modifiedUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()


    assert(result.body.error.includes(
      'You cannot remove admin rights from this user.'
    ))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    assert.strictEqual(userToModify.admin, true)
    }
  )


  it('fails with status code 400 if token is missing', async () => {

    const usersAtStart = await helper.usersInDb()
    const userToModify = usersAtStart[1]

    const modifiedUser = {
      admin: true,
    }

    const result = await api
      .put(`/api/users/${userToModify.id.toString()}`)
      .send(modifiedUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes(
      'Token missing or invalid.'
    ))

    assert.strictEqual(userToModify.admin, false)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })
  it('fails with status code 400 if token is invalid', async () => {

    const usersAtStart = await helper.usersInDb()
    const userToModify = usersAtStart[1]

    const modifiedUser = {
      admin: true,
    }

    const invalidToken = 'invalidtoken'

    const result = await api
      .put(`/api/users/${userToModify.id.toString()}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(modifiedUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('Token missing or invalid'))

    assert.strictEqual(userToModify.admin, false)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

})

describe('operations without admin rights: ', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'user', passwordHash })

    await user.save()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  it(
    'modification of a user fails with valid data and id',
    async () => {
      const testUser = {
        username: 'testuser',
        password: 'Password1!',
        admin: false
      }
    
      await api
        .post('/api/users')
        .send(testUser)
      const userresponse = await api
        .post('/api/login')
        .send(testUser)
    
      const usertoken = userresponse.body.token

      const usersAtStart = await helper.usersInDb()

      const userToModify = usersAtStart[0]

      const modifieduser = {
        admin: true,
      }

      const result = await api
        .put(`/api/users/${userToModify.id}`)
        .send(modifieduser)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('This operation is for admins only.'))

    }
  )

  it('deletion of a user fails with valid id', async () => {
    const usersAtStart = await helper.usersInDb()
    const userToDelete = usersAtStart[0]
    const testUser = {
      username: 'testuser',
      password: 'Password1!',
      admin: false
    }
  
    await api
      .post('/api/users')
      .send(testUser)
    const userresponse = await api
      .post('/api/login')
      .send(testUser)

      const testAdmin = {
        username: 'admin',
        password: 'Password1!',
        admin: true
      }
    
      await api
        .post('/api/users')
        .send(testAdmin)
     await api
        .post('/api/login')
        .send(testAdmin)
  
    const usertoken = userresponse.body.token


    const result = await api
      .delete(`/api/users/${userToDelete.id}`)
      .set('Authorization', `Bearer ${usertoken}`)
      .expect(400)

    assert(result.body.error.includes('This operation is for admins only.'))


  })
})

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({})
  }
  await mongoose.connection.close()
})