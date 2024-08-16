import { useState, useEffect } from 'react';
import { Game } from "../types";
import { getAllGames } from '../services/gameService';
import React from 'react';


const Games = () => {

  const [games, setGames] = useState<Game[]>([
    { id: 1, date: '1.1.2023', home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  ]);

  useEffect(() => {
    getAllGames().then((data: React.SetStateAction<Game[]>) => {
      setGames(data);
    });
  }, []);



  return (
    <div>
      <h2>Games</h2>
      <ul>
        {games.map(game =>
          <li key={game.id}>
            <strong>{game.date}</strong><br />
            Home Team: {game.home_team} <br />
            Visitor Team: {game.visitor_team} <br />
            <br />
          </li>
        )}
      </ul>
    </div>
  );
};

export default Games;