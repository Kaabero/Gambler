import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { getGameById } from '../services/gameService';
import { Game, Bet } from '../types';
import { formatDate } from '../utils/dateUtils';





const GamesBets = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [game, setGame] = useState<Game>(
    { id: '1',
      date: new Date() ,
      home_team: 'HomeTeam',
      visitor_team: 'VisitorTeam' }
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
      <strong>Tournament: </strong>{game.tournament?.name}<br />
      <br />
      <strong>Game: </strong><br />
      <br />
      {formatDate(new Date(game.date))}<br />
      {game.home_team}-{game.visitor_team} <br />
      <br />
      <hr />
      <h2>Bets: </h2>
      <div>
        {game.bets && game.bets?.length > 0 && (
          <>
            <ul className= 'ul-small'>
              {bets.map(bet =>
                <li className= 'li-small' key={bet.id}>
                  <p>User: {bet.user.username}</p>
                  <p>Bet: {bet.goals_home}-{bet.goals_visitor}</p>
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
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GamesBets;