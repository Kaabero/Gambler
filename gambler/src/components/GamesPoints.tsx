import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { getAllBets } from '../services/betService';
import { getOutcomeById } from '../services/outcomeService';
import { Bet, Outcome, Scores, User } from '../types';
import { formatDate } from '../utils/dateUtils';




const GamesPoints = () => {
  const navigate = useNavigate();
  const { outcomeId } = useParams();
  const [outcome, setOutcome] = useState<Outcome>(
    { id: '1',
      goals_home: '1',
      goals_visitor: '1',
      game: {
        id: '1',
        date: new Date() ,
        home_team: 'HomeTeam',
        visitor_team: 'VisitorTeam' } }
  );
  const [scores, setScores] = useState<Scores[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);


  useEffect(() => {
    if (outcomeId) {
      getOutcomeById(outcomeId).then(setOutcome);
    }
  }, [outcomeId]);

  useEffect(() => {
    if (outcome && outcome.scores) {
      setScores(outcome.scores);
    }
  }, [outcome]);

  useEffect(() => {
    getAllBets().then((data) => {
      setBets(data);
    });
  }, []);



  const handleGoBackClick = () => {
    navigate(-1);
  };

  const usersBet = (user: User, outcome: Outcome): string => {
    const bet = bets
      .find((bet) =>
        bet.user && bet.user.id === user.id && bet.game.id === outcome.game.id
      );
    return `${bet?.goals_home} - ${bet?.goals_visitor}`;
  };

  return (
    <div>
      <strong>Tournament: </strong>{outcome.game.tournament?.name}<br />
      <br />
      <strong>Game: </strong><br />
      <br />
      {formatDate(new Date(outcome.game.date))}<br />
      {outcome.game.home_team}-{outcome.game.visitor_team} <br />
      <br />
      Result: {outcome.goals_home} - {outcome.goals_visitor}
      <hr />
      <h2>Points: </h2>
      <div>
        {outcome.scores && outcome.scores?.length > 0 && (
          <>
            <ul className= 'ul-small'>
              {scores.map(score =>
                <li className= 'li-small' key={score.id}>
                  <strong>User:</strong> {score.user.username}<br />
                  <br />
                  <strong>Points: </strong> {score.points}<br />
                  <br />
                  <strong>Users bet:</strong> {usersBet(score.user, outcome)}
                </li>
              )}
            </ul>
          </>
        )}
      </div>
      {!outcome.scores || outcome.scores?.length === 0 && (
        <>
          <p> There are no points received from this game </p>
        </>
      )}
      <hr />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GamesPoints;