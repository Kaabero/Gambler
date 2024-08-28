import { useState, useEffect } from 'react';
import { Game } from "../types";
import { useNavigate } from 'react-router-dom';
import { getAllGames, createGame } from '../services/gameService';
import React from 'react';
import { AxiosError } from 'axios';

interface GameFormProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const GameForm: React.FC<GameFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const [date, setDate] = useState('');
  const [visitorTeam, setVisitorTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    getAllGames().then(data => {
      setGames(data);
    });
  }, []);

  const gameCreation = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {

      const newGame: Game = {
        date: new Date(date),
        home_team: homeTeam,
        visitor_team: visitorTeam,
        id: '0'
      };

      const savedGame = await createGame(newGame);
      setGames(games.concat(savedGame));
      setNotificationMessage('Game added successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/');
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleCancel = () => {

    navigate(`/`);
  };

  return (
    <div>
      <h2>Add new game</h2>
      <form onSubmit={gameCreation}>
        <div>
          Date and time:
          <br />
          <input
            type='datetime-local'
            value={date}
            onChange={({ target }) => setDate(target.value)}
          />
        </div>
        <br />
        <div>
          Home Team:
          <br />
          <input
            value={homeTeam}
            onChange={({ target }) => setHomeTeam(target.value)}
          />
        </div>
        <br />
        <div>
          Visitor Team:
          <br />
          <input
            value={visitorTeam}
            onChange={({ target }) => setVisitorTeam(target.value)}
          />
        </div>
        <br />
        <button type="submit">Add</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default GameForm;
