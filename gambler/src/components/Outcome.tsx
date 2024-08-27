import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, User } from "../types";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { removeOutcome } from '../services/outcomeService';


interface OutcomeFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User
}

const Outcome: React.FC<OutcomeFormProps> = ({ user, setErrorMessage, setNotificationMessage }) => {
  const { gameId } = useParams();
  const [game, setGame] = useState<Game>(
    { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(setGame);
    }
  }, [gameId]);

  const handleGoHome = () => {
    navigate('/');

    setNotificationMessage('');
  };

  const handleRemoveOutcome = (game: Game) => {
    if (game.outcome) {
      removeOutcome(game.outcome?.id);
      setNotificationMessage('Outcome deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/');
    } else {
      setErrorMessage('No outcome found');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      navigate('/');
    }
  };

  return (
    <div>
      <h2>Game:</h2>
      <p>{game.home_team}-{game.visitor_team}</p>
      <h2>Outcome:</h2>
      <p>{game.outcome?.goals_home}-{game.outcome?.goals_visitor}</p>

      <button type="button" onClick={handleGoHome}>Go back home</button>
      {user.admin &&(
        <>
          <button onClick={() => handleRemoveOutcome(game)}>Delete</button>
        </>
      )}
    </div>
  );
};

export default Outcome;
