import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { NewBet, Game } from '../types';
import React from 'react';
import { addBet } from '../services/betService';
import { AxiosError } from 'axios';
import { getGameById } from '../services/gameService';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

interface AddBetFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddBetForm: React.FC<AddBetFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game>(
    { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  );
  const [visitorGoals, setVisitorGoals] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(setGame);
    }
  }, [gameId]);

  const handleCancel = () => {
    navigate('/');
  };


  const betCreation = async (event: React.SyntheticEvent) => {

    event.preventDefault();

    if (game) {
      try {
        const newBet: NewBet = {
          goals_home: homeGoals,
          goals_visitor: visitorGoals,
          game: game.id,
        };

        await addBet(newBet);

        setNotificationMessage('Bet added successfully!');
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
    }
  };

  return (
    <div>
      <h2>Add a new bet </h2>
      <strong> Tournament: </strong> <br />
      {game?.tournament?.name}<br />
      <br />
      <strong> Game: </strong> <br />
      {game?.home_team}-{game?.visitor_team}<br />
      {formatDate(new Date(game?.date))} <br />
      <br />
      <form onSubmit={betCreation}>
        <div>
          Goals for {game?.home_team}:
          <br />
          <input
            type="number"
            value={homeGoals}
            onChange={({ target }) => setHomeGoals(target.value)}
            min="0"
          />
        </div>
        <br />
        <div>
          Goals for {game?.visitor_team}:
          <br />
          <input
            type="number"
            value={visitorGoals}
            onChange={({ target }) => setVisitorGoals(target.value)}
            min="0"
          />
        </div>
        <br />
        <button type="submit">Add bet</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default AddBetForm;
