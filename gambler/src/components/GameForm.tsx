import { useState, useEffect } from 'react';
import { Game } from "../types";
import { getAllGames, createGame } from '../gameService';
import React from 'react';

interface GameFormProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}
  
const GameForm: React.FC<GameFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const [date, setDate] = useState('');
  const [visitorTeam, setVisitorTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [games, setGames] = useState<Game[]>([
    { id: 1, date: '2023-02-13', home_team: 'SWW', visitor_team: 'KLL', outcome_added: true }
  ]);

  useEffect(() => {
    getAllGames().then(data => {
      setGames(data);
    });
  }, []);

  const gameCreation = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      const newGame: Game = {
        date,
        home_team: homeTeam,
        visitor_team: visitorTeam,
        outcome_added: false,
        id: 0
      };

      const savedGame = await createGame(newGame);
      setGames(games.concat(savedGame));
      setNotificationMessage('Game added successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);

    
      setDate('');
      setHomeTeam('');
      setVisitorTeam('');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  return (
    <div>
      <h2>Add New Game</h2>
      <form onSubmit={gameCreation}>
        <div>
          Date: 
          <input
            type='date'
            value={date}
            onChange={({ target }) => setDate(target.value)}
          />
        </div>
        <br />
        <div>
          Home Team:
          <input
            value={homeTeam}
            onChange={({ target }) => setHomeTeam(target.value)}
          />
        </div>
        <br />
        <div>
          Visitor Team:
          <input
            value={visitorTeam}
            onChange={({ target }) => setVisitorTeam(target.value)}
          />
        </div>
        
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default GameForm;
