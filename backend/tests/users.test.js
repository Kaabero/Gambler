const assert = require('node:assert')
const { test, after, describe, beforeEach, afterEach } = require('node:test')

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

  test('creation succeeds with a fresh username', async () => {
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

  test(
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
      assert(result.body.error.includes('Username already taken'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    }
  )


  test(
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
        `Password must be at least 8 characters long and include uppercase,
       lowercase, number, and special character`
      ))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
}
)

after(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
})