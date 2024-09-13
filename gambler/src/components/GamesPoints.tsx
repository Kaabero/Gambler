import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Outcome, User, Scores } from '../types';
import React from 'react';
import { getOutcomeById } from '../services/outcomeService';
import { formatDate } from '../utils/dateUtils';
import { removeScores } from '../services/scoreService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';


interface GamesPointsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User
}

const GamesPoints: React.FC<GamesPointsProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
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


  const handleRemovePoints = async (id: string) => {
    try {
      await removeScores(id);
      setScores(scores.filter(score => score.id !== id));
      setNotificationMessage('Scores deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleEditPointsClick = (scores: Scores) => {
    navigate(`/editScores/${scores.id}`);
  };

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
                  { loggedUser.admin && (
                    <>
                      <button onClick={() => handleRemovePoints(score.id)}>Delete points</button>
                      <button onClick={() => handleEditPointsClick(score)}>Edit points</button>
                    </>
                  )}
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