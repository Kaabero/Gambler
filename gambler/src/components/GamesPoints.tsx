import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Outcome, Scores } from '../types';
import React from 'react';
import { getOutcomeById } from '../services/outcomeService';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';



const GamesPoints = () => {
  const navigate = useNavigate();
  const { outcomeId } = useParams();
  const [outcome, setOutcome] = useState<Outcome>(
    { id: '1', goals_home: '1', goals_visitor: '1', game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }
  );
  const [scores, setScores] = useState<Scores[]>([]);


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



  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <div>
      <hr />
      <strong>Tournament: </strong>{outcome.game.tournament?.name}<br />
      <br />
      <strong>Game: </strong><br />
      <br />
      {formatDate(new Date(outcome.game.date))}<br />
      {outcome.game.home_team}-{outcome.game.visitor_team} <br />
      <br />
      <h2>Points: </h2>
      <div>
        {outcome.scores && outcome.scores?.length > 0 && (
          <>
            <ul>
              {scores.map(score =>
                <li key={score.id}>
                  <hr />
                  <strong>User:</strong> {score.user.username}<br />
                  <br />
                  <strong>Points: </strong> {score.points}<br />
                  <br />
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
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GamesPoints;