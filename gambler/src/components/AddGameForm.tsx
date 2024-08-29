import { useState, useEffect } from 'react';
import { Game, Tournament } from '../types';
import { useNavigate } from 'react-router-dom';
import { getAllGames, createGame } from '../services/gameService';
import { getAllTournaments } from '../services/tournamentService';
import React from 'react';
import { AxiosError } from 'axios';

interface AddGameFormProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddGameForm: React.FC<AddGameFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const [date, setDate] = useState('');
  const [visitorTeam, setVisitorTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');

  useEffect(() => {
    getAllGames().then(data => {
      setGames(data);
    });
  }, []);

  useEffect(() => {
    getAllTournaments().then(data => {
      setTournaments(data);
    });
  }, []);

  const gameCreation = async (event: React.SyntheticEvent) => {

    event.preventDefault();

    try {

      const newGame: Game = {
        date: new Date(date),
        home_team: homeTeam,
        visitor_team: visitorTeam,
        tournament: selectedTournament,
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

    navigate('/');
  };

  return (
    <div>
      <h2>Add new game</h2>
      <form onSubmit={gameCreation}>
        <br />
        <select
          id="tournament-select"
          value={selectedTournament}
          onChange={({ target }) => setSelectedTournament(target.value)}
          required
        >
          <option value="" disabled>
            -- Choose a tournament --
          </option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.tournament}
            </option>
          ))}
        </select>
        <div>
          <br />
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

export default AddGameForm;
