import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, User } from "../types";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { removeOutcome } from '../services/outcomeService';



interface GameResultProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User
}

const GameResult: React.FC<GameResultProps> = ({ user, setErrorMessage, setNotificationMessage }) => {
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

  const handleGoHomeClick = () => {
    navigate('/');

    setNotificationMessage('');
  };

  const handleRemoveResultClick = (game: Game) => {
    if (game.outcome) {
      removeOutcome(game.outcome?.id);
      setNotificationMessage('Result and related scores deleted successfully!');
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
      <h2>Result:</h2>
      <p>{game.outcome?.goals_home}-{game.outcome?.goals_visitor}</p>

      <button type="button" onClick={handleGoHomeClick}>Go back home</button>
      {user.admin &&(
        <>
          <button onClick={() => handleRemoveResultClick(game)}>Delete the result and related scores</button>
        </>
      )}
    </div>
  );
};

export default GameResult;
