const Game = ({ game }) => {
    return (
      <li>{game.home_team}-{game.visitor_team} on {game.date}</li>
    )
}

export default Game