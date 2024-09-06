import { useState, useEffect } from 'react';
import { Game, NewGame, Tournament } from '../types';
import { useNavigate } from 'react-router-dom';
import { getAllGames, createGame } from '../services/gameService';
import { getAllTournaments } from '../services/tournamentService';
import React from 'react';
import { AxiosError } from 'axios';
import { getTournamentById } from '../services/tournamentService';

interface AddGameFormProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
    selectedTournament: string;
}

const AddGameForm: React.FC<AddGameFormProps> = ({ selectedTournament, setErrorMessage, setNotificationMessage }) => {
  const [date, setDate] = useState('');
  const [visitorTeam, setVisitorTeam] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [addToTournament, setTournament] = useState('');
  const [tournament, setDefaultTournament] = useState<Tournament>();

  useEffect(() => {
    getAllGames().then(data => {
      setGames(data);
    });
  }, []);

  useEffect(() => {
    getAllTournaments().then(data => {
      setTournaments(data);
    });
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setDefaultTournament(data);
      });
    }
  }, [selectedTournament]);

  const gameCreation = async (event: React.SyntheticEvent) => {

    event.preventDefault();

    try {

      const newGame: NewGame = {
        date: new Date(date),
        home_team: homeTeam,
        visitor_team: visitorTeam,
        tournament: addToTournament,
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
  console.log('tournament', tournament)
  return (
    <div>
      <h2>Add new game</h2>
      <form onSubmit={gameCreation}>
        <br />
        <p>Choose a tournament</p>
        <select
          id="tournament-select"
          value={addToTournament}
          onChange={({ target }) => setTournament(target.value)}
          required
        >
          <option value="" >
            {tournament ? tournament.name : '-- Choose a tournament --'}
          </option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
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
