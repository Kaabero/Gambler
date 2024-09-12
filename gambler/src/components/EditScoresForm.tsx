import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Scores } from '../types';
import React from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getScoresById } from '../services/scoreService';
import { editScores } from '../services/scoreService';
import { formatDate } from '../utils/dateUtils';




interface EditScoresFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditScoresForm: React.FC<EditScoresFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { scoresId } = useParams<{ scoresId: string }>();
  const [scores, setScores] = useState<Scores | null>(null);
  const [points, setPoints] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (scoresId) {
      getScoresById(scoresId).then(score => {
        setScores(score);
        setPoints(score.points);
      });
    }
  }, [scoresId]);

  const scoresEdition = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (scores) {
      const updatedScores: Scores = {
        ...scores,
        points: points || scores.points
      };

      try {
        await editScores(updatedScores.id, updatedScores);
        setNotificationMessage('Scores edited successfully!');
        setTimeout(() => {
          setNotificationMessage('');
        }, 3000);
        navigate(-1);

      } catch (error) {
        if (error instanceof AxiosError) {
          setErrorMessage(`${error.response?.data.error}`);
          setTimeout(() => {
            setErrorMessage('');
          }, 3000);
        }
      }
    } else {
      setErrorMessage('No scores found.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <><div>

      <h2>Edit the scores</h2>
      {scores ? (
        <div>
          <strong>Tournament: </strong>
          {scores?.outcome.game.tournament?.name}<br />
          <br />
          <strong>Game: </strong><br />
          <br />
          <div>
            {formatDate(new Date(scores.outcome.game.date))}<br />
            {scores?.outcome.game.home_team}-{scores?.outcome.game.visitor_team} <br />
            <br />
            <strong>User: </strong>
            {scores?.user.username}<br />
            <form onSubmit={scoresEdition}>
              <br />
              <div>
              Points:
                <br />
                <input
                  type="number"
                  value={points}
                  onChange={({ target }) => setPoints(target.value)}
                  min="0"
                />
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={handleGoBackClick}>Cancel</button>
              <br />
              <br />
            </form>
          </div>
        </div>

      ) : (
        <><p>There are no points to edit in the selected game for this user</p><br />
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button></>
      )}
    </div><div>
    </div></>
  );
};

export default EditScoresForm;