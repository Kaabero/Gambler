import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, Outcome } from '../types';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { formatDate } from '../utils/dateUtils';



const GameResult = () => {
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
  };

  const handleCheckPoints = (outcome: Outcome) => {

    navigate(`/gamespoints/${outcome.id}`);
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
