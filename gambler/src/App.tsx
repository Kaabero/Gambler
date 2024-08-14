import { useState, useEffect } from 'react';
import { Game } from "./types";
import { getAllGames } from './gameService';
import React from 'react';
import Notification from './components/Notification'
import GameForm from './components/GameForm';

const App = () => {
  const [errormessage, setErrorMessage] = useState('');
  const [notificationmessage, setNotificationMessage] = useState('');
  const [games, setGames] = useState<Game[]>([
    { id: 1, date: '2023-02-13', home_team: 'SWW', visitor_team: 'KLL', outcome_added: true }
  ]);

  useEffect(() => {
    getAllGames().then(data => {
      setGames(data);
    });
  }, []);

  return (
    <div>
      <h2>Games</h2>
      <Notification errormessage={errormessage} notificationmessage={notificationmessage} />
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
      <GameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} />
    </div>
  );
};

export default App;
