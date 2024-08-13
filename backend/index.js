const express = require('express')
const app = express()
require('dotenv').config()

const Game = require('./models/game')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

const cors = require('cors')

app.use(cors())
app.use(express.json())


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


let users = [
    {
      id: "1",
      username: "test",
      password: "test",
    },
    {
      id: "2",
      username: "admin",
      password: "admin"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  

app.get('/api/users', (request, response) => {
    response.json(users)
})
 
app.get('/api/games', (request, response) => {
  Game.find({}).then(games => {
    response.json(games)
  })
})

app.post('/api/games', (request, response) => {
  const body = request.body

  if (body.home_team === undefined || body.visitor_team === undefined || body.date === undefined) {
    return response.status(400).json({ error: 'required field(s) missing' })
  }

  const game = new Game({
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date,
    outcome_added: body.outcome_added || false,
  })

  game.save().then(savedGame => {
    response.json(savedGame)
  })
})

app.get('/api/games/:id', (request, response, next) => {
  Game.findById(request.params.id)
    .then(game => {
      if (game) {
        response.json(game)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/games/:id', (request, response, next) => {
  Game.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/games/:id', (request, response, next) => {
  const body = request.body

  const game = {
    home_team: body.home_team,
    visitor_team: body.visitor_team,
    date: body.date,
    outcome_added: body.outcome_added || false,
  }

  Game.findByIdAndUpdate(request.params.id, game, { new: true })
    .then(updatedGame => {
      response.json(updatedGame)
    })
    .catch(error => next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})