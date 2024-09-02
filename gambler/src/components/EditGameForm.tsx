import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Game } from '../types';
import React from 'react';
import { formatDateForInput } from '../utils/dateUtils';
import { editGame } from '../services/gameService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';

interface EditGameFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditGameForm: React.FC<EditGameFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [date, setDate] = useState<string>('');
  const [visitorTeam, setVisitorTeam] = useState<string>('');
  const [homeTeam, setHomeTeam] = useState<string>('');
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
      const updatedGame: Game = {
        ...game,
        date: new Date(date),
        home_team: homeTeam || game.home_team,
        visitor_team: visitorTeam || game.visitor_team,
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

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      <h2>Edit the game</h2>
      <form onSubmit={gameEdition}>
        <div>
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
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default EditGameForm;




