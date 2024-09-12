import { useState, useEffect } from 'react';
import { Outcome, User, Scores } from '../types';
import { getAllOutcomes } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { removeScores } from '../services/scoreService';
import { AxiosError } from 'axios';

interface PointsProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
    loggedUser: User
  }


const Points: React.FC<PointsProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
  const navigate = useNavigate();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);


  useEffect(() => {
    getAllOutcomes().then((data) => {
      setOutcomes(data);
    });
  }, []);

  const handleRemovePoints = async (id: string) => {
    try {
      await removeScores(id);
      setOutcomes(
        outcomes.map(outcome => ({
          ...outcome,
          scores: outcome.scores?.filter(score => score.id !== id),
        }))
      );
      setNotificationMessage('Points deleted successfully!');
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

  const outcomesWithScores = outcomes.filter((outcome) => !outcome.scores || outcome.scores.length > 0);

  const sortedOutcomes = [...outcomesWithScores].sort((a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime());


  return (
    <div>
      <h2>Received points</h2>

      {outcomesWithScores.length > 0 && (
        <>

          <ul>
            {sortedOutcomes.map((outcome) => (
              <li key={outcome.id}>
                <hr />
                <strong>Tournament: </strong> {outcome.game.tournament?.name}<br />
                <br />
                <strong>Game: </strong> <br />
                <br />
                {formatDate(new Date(outcome.game.date))}
                <br />
                {outcome.game.home_team} - {outcome.game.visitor_team}<br />
                <br />
                <strong>Game result: </strong>

                <br />
                {outcome.goals_home} - {outcome.goals_visitor}
                <br />

                <br />

                {outcome.scores?.map((score) => (
                  <div key={score.id}>
                    <strong>User:</strong> {score.user.username}<br />
                    <br />
                    <strong>Points:</strong> {score.points}
                    <br />
                    <br />
                    { loggedUser.admin && (
                      <>
                        <button onClick={() => handleRemovePoints(score.id)}>Delete points</button>
                        <button onClick={() => handleEditPointsClick(score)}>Edit points</button>
                        <br />
                      </>
                    )}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
      {outcomesWithScores.length === 0 && (
        <>
          <p> There are no points added </p>
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
    </div>
  );
};

export default Points;