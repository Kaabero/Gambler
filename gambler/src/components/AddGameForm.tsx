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
  const [defaultTournament, setDefaultTournament] = useState<Tournament>();

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

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setDefaultTournament(data);
        setTournament(data.id);
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

  const handleCancelClick = () => {

    navigate('/');
  };

  const handleAddTournamentClick = () => {

    navigate('/addTournament');
  };


  return (
    <div>
      { tournaments.length > 0 && (
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
              {!defaultTournament && (
                <option value="" disabled>
            -- Choose a tournament --
                </option>
              )}
              {defaultTournament && (
                <option key={defaultTournament.id} value={defaultTournament.id}>
                  {defaultTournament.name}
                </option>
              )}
              {tournaments
                .filter(tournament => tournament.id !== defaultTournament?.id)
                .map((tournament) => (
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
            <button type="button" onClick={handleCancelClick}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {tournaments.length === 0 && (
        <>
          <br />
          <h3> There isn't any tournaments where you can add a game </h3>
          <button type="button" onClick={handleAddTournamentClick}>Add a tournament</button>
          <button type="button" onClick={handleCancelClick}>Go Home</button>
        </>
      )}
    </div>
  );
};

export default AddGameForm;
