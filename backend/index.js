const express = require('express')
const app = express()

const cors = require('cors')

app.use(express.json())
app.use(cors())

let games = [
  {
    id: "1",
    home_team: "Finland",
    visitor_team: "Sweden",
    date: "1.1.2024"
  },
  {
    id: "2",
    home_team: "Norway",
    visitor_team: "USA",
    date: "3.5.2024"
  },
  {
    id: "3",
    home_team: "USA",
    visitor_team: "Canada",
    date: "5.12.2025"
  }
]

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
  
app.get('/api/games', (request, response) => {
    response.json(games)
})

app.get('/api/users', (request, response) => {
    response.json(users)
})
 
app.get('/api/games/:id', (request, response) => {
    const id = request.params.id
    const game = games.find(game => game.id === id)

    if (game) {
        response.json(game)
      } else {
        response.status(404).end()
    }
})

app.delete('/api/games/:id', (request, response) => {
    const id = request.params.id
    games = notes.filter(game => game.id !== id)
  
    response.status(204).end()
})

app.post('/api/games', (request, response) => {
    const maxId = games.length > 0
      ? Math.max(...games.map(n => Number(n.id))) 
      : 0
  
    const game = request.body
    game.id = String(maxId + 1)
  
    games = games.concat(game)
  
    response.json(game)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})