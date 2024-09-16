import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, Bet } from '../types';
import React from 'react';
import { getGameById } from '../services/gameService';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';




const GamesBets = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [game, setGame] = useState<Game>(
    { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  );
  const [bets, setBets] = useState<Bet[]>([]);


  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(setGame);
    }
  }, [gameId]);

  useEffect(() => {
    if (game && game.bets) {
      setBets(game.bets);
    }
  }, [game]);


  const handleGoBackClick = () => {
    navigate(-1);
  };


  return (
    <div>
      <hr />
      <strong>Tournament: </strong>{game.tournament?.name}<br />
      <br />
      <strong>Game: </strong><br />
      <br />
      {formatDate(new Date(game.date))}<br />
      {game.home_team}-{game.visitor_team} <br />
      <br />
      <h2>Bets: </h2>
      <div>
        {game.bets && game.bets?.length > 0 && (
          <>
            <ul>
              {bets.map(bet =>
                <li key={bet.id}>
                  <hr />
                  <strong>User:</strong> {bet.user.username}<br />
                  <br />
                  <strong>Bet: </strong> {bet.goals_home}-{bet.goals_visitor}<br />
                  <br />
                </li>
              )}
            </ul>
          </>
        )}
      </div>
      {!game.bets || game.bets?.length === 0 && (
        <>
          <p> There are no bets for this game </p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GamesBets;