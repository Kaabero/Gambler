import { useState, useEffect } from 'react'
import Game from "./components/Game"
import gameService from './services/games'


const App = () => {
  const [games, setGames] = useState([])

  useEffect(() => {
    gameService
      .getAll()
      .then(initialGames => {
        setGames(initialGames)
      })
  }, [])


  return (
    <div>
      <h1>Games</h1>
      <ul>
        {games.map(game => 
          <Game key={game.id} game={game} />
        )}
      </ul>
    </div>
  )
}

export default App