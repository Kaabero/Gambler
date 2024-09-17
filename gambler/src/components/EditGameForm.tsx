import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Game, NewGame, Tournament } from '../types';
import React from 'react';
import { formatDateForInput } from '../utils/dateUtils';
import { editGame } from '../services/gameService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { formatDate } from '../utils/dateUtils';
import { getAllTournaments } from '../services/tournamentService';
import { formatSimpleDate } from '../utils/dateUtils';

interface EditGameFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditGameForm: React.FC<EditGameFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [date, setDate] = useState<string>('');
  const [visitorTeam, setVisitorTeam] = useState<string>('');
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [newTournament, setNewTournament] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(game => {
        setGame(game);
        setDate(formatDateForInput(new Date(game.date)));
        setVisitorTeam(game.visitor_team);
        setHomeTeam(game.home_team);
      });
    }
  }, [gameId]);

  useEffect(() => {
    getAllTournaments().then(data => {
      setTournaments(data);
    });
  }, []);


  const gameEdition = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (homeTeam.trim().toLowerCase() === visitorTeam.trim().toLowerCase()) {
      setErrorMessage('Home team and visitor team cannot be the same.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    if (game) {
      const updatedGame: NewGame = {
        ...game,
        date: new Date(date),
        home_team: homeTeam || game.home_team,
        visitor_team: visitorTeam || game.visitor_team,
        tournament: newTournament || game.tournament?.id,
      };

      try {
        await editGame(updatedGame.id, updatedGame);
        setNotificationMessage('Game updated successfully!');
        setTimeout(() => {
          setNotificationMessage('');
        }, 3000);
        navigate(-1);
      } catch (error) {
        if (error instanceof AxiosError) {
          setErrorMessage(`${error.response?.data.error}`);
          setTimeout(() => {
            setErrorMessage('');
          }, 3000);
        }
      }
    } else {
      setErrorMessage('No game found.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <div>

      <h2>Edit the game</h2>
      <hr />
      { game && game.tournament && (
        <div>
          <strong> Initial game information: </strong> <br />
          <p> Tournament: {game.tournament?.name}</p>
          <p> Home team: {game.home_team}</p>
          <p> Visitor team: {game.visitor_team}</p>
          <p> Date: {formatDate(new Date(game.date))} </p>
          <hr />
          <strong> Edit game information: </strong> <br />
          <br />
          <form onSubmit={gameEdition}>
            Tournament: <br />
            <select
              id="tournament-select"
              value={newTournament}
              onChange={({ target }) => setNewTournament(target.value)}
              required
            >

              <option key={game.tournament.id} value={game.tournament.id}>
                {game.tournament.name}: {formatSimpleDate(new Date(game.tournament.from_date))}-{formatSimpleDate(new Date(game.tournament.to_date))}
              </option>
              {tournaments
                .filter(tournament => tournament.id !== game.tournament?.id)
                .map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}: {formatSimpleDate(new Date(tournament.from_date))}-{formatSimpleDate(new Date(tournament.to_date))}
                  </option>
                ))}
            </select>
            <div>
              <br />
          Date:
              <br />
              <input
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
                value={homeTeam}
                onChange={({ target }) => setHomeTeam(target.value)}
              />
            </div>
            <br />
            <div>
          Visitor team:
              <br />
              <input
                value={visitorTeam}
                onChange={({ target }) => setVisitorTeam(target.value)}
              />
            </div>
            <br />
            <button type="submit">Save</button>
            <button type="button" onClick={handleGoBackClick}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {!game && (
        <>
          <br />
          <p> No game selected for editing. </p>
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default EditGameForm;




