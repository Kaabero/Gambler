const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const gamesRouter = require('./controllers/games')
const usersRouter = require('./controllers/users')
const betsRouter = require('./controllers/bets')
const outcomesRouter = require('./controllers/outcomes')
const loginRouter = require('./controllers/login')
const scoresRouter = require('./controllers/scores')
const tournamentsRouter = require('./controllers/tournaments')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

console.log('app.js mongo url', config.MONGODB_URI)
console.log('app.js envi', process.env.NODE_ENV)
logger.info('Connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info(`Connected to MongoDB ${config.MONGODB_URI}`)
  })
  .catch((error) => {
    logger.error('Error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)


app.use('/api/games', gamesRouter)
app.use('/api/bets', betsRouter)
app.use('/api/users', usersRouter)
app.use('/api/outcomes', outcomesRouter)
app.use('/api/login', loginRouter)
app.use('/api/scores', scoresRouter)
app.use('/api/tournaments', tournamentsRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app