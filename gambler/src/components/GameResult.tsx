import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, User, Outcome } from '../types';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { removeOutcome } from '../services/outcomeService';
import { formatDate } from '../utils/dateUtils';



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

  const handleGoBackClick = () => {
    navigate(-1);

    setNotificationMessage('');
  };

  const handleCheckPoints = (outcome: Outcome) => {

    navigate(`/gamespoints/${outcome.id}`);
  };

  const handleRemoveResultClick = (game: Game) => {
    if (confirm('Deleting game result will also remove related scores!')) {
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
    } else {
      return;
    }
  };

  return (
    <div>
      <hr />

      {game.outcome && (
        <div>
          <strong>Tournament: </strong>{game.tournament?.name}<br />
          <br />
          <strong>Game: </strong><br />
          {game.home_team}-{game.visitor_team}<br />
          {formatDate(new Date(game.date))}<br />
          <br />
          <strong>Result:</strong> {game.outcome.goals_home}-{game.outcome.goals_visitor}<br />
          <br />
          <button onClick={() => game.outcome && handleCheckPoints(game.outcome)}>Check received points</button>
          {user.admin &&(
            <>
              <button onClick={() => handleRemoveResultClick(game)}>Delete the result and related points</button>
            </>
          )}
        </div>
      )}
      {!game.outcome && (
        <>
          <h2>Game result </h2>
          <p> There are no game result added </p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GameResult;
