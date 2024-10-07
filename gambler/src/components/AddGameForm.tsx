import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllGames, createGame } from '../services/gameService';
import { getAllTournaments } from '../services/tournamentService';
import { getTournamentById } from '../services/tournamentService';
import { Game, NewGame, Tournament } from '../types';
import { formatSimpleDate } from '../utils/dateUtils';

interface AddGameFormProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
    selectedTournament: string;
}

const AddGameForm: React.FC<AddGameFormProps> = ({
  selectedTournament,
  setErrorMessage,
  setNotificationMessage
}) => {
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
      navigate('/adminTools');
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleGoBackClick = () => {

    navigate(-1);
  };

  const handleAddTournamentClick = () => {

    navigate('/addTournament');
  };


  return (
    <div>
      <hr />
      { tournaments.length > 0 && (
        <div>
          <h2>Add a new game</h2>
          <form onSubmit={gameCreation}>
            <p>Choose a tournament: </p>
            <select
              className='select-in-form'
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
                  {defaultTournament.name}:&nbsp;
                  {formatSimpleDate(new Date(defaultTournament.from_date))}-
                  {formatSimpleDate(new Date(defaultTournament.to_date))}
                </option>
              )}
              {tournaments
                .filter(tournament => tournament.id !== defaultTournament?.id)
                .map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}:&nbsp;
                    {formatSimpleDate(new Date(tournament.from_date))}-
                    {formatSimpleDate(new Date(tournament.to_date))}
                  </option>
                ))}
            </select>
            <div>
              <br />
          Date and time:
              <br />
              <input
                data-testid='date'
                type='datetime-local'
                value={date}
                onChange={({ target }) => setDate(target.value)}
              />
            </div>
            <br />
            <div>
          Home team:
              <br />
              <input
                data-testid='hometeam'
                value={homeTeam}
                onChange={({ target }) => setHomeTeam(target.value)}
              />
            </div>
            <br />
            <div>
          Visitor team:
              <br />
              <input
                data-testid='visitorteam'
                value={visitorTeam}
                onChange={({ target }) => setVisitorTeam(target.value)}
              />
            </div>
            <br />
            <button type="submit">Add</button>
            <button type="button" onClick={handleGoBackClick}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {tournaments.length === 0 && (
        <>
          <p> There isn't any tournaments where you can add a game </p>
          <br />
          <button type="button" onClick={handleAddTournamentClick}>
            Add a tournament</button>
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default AddGameForm;
