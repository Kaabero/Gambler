import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { getAllBets } from '../services/betService';
import { getScoresById } from '../services/scoreService';
import { editScores } from '../services/scoreService';
import { Scores, User, Outcome, Bet } from '../types';
import { formatDate } from '../utils/dateUtils';




interface EditScoresFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditScoresForm: React.FC<EditScoresFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { scoresId } = useParams<{ scoresId: string }>();
  const [scores, setScores] = useState<Scores | null>(null);
  const [points, setPoints] = useState<string>('');
  const [bets, setBets] = useState<Bet[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (scoresId) {
      getScoresById(scoresId).then(score => {
        setScores(score);
        setPoints(score.points);
      });
    }
  }, [scoresId]);

  useEffect(() => {
    getAllBets().then((data) => {
      setBets(data);
    });
  }, []);

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

  const usersBet = (user: User, outcome: Outcome): string => {
    const bet = bets.find(
      (bet) => bet.user && bet.user.id === user.id && bet.game.id === outcome.game.id
    );
    return `${bet?.goals_home}-${bet?.goals_visitor}`;
  };

  return (
    <div>
      <h2>Edit the points</h2>
      <hr />
      {scores ? (
        <div>
          <strong>Game: </strong><br />
          <p>Tournament: {scores.outcome.game.tournament?.name}</p>
          <div>
            {formatDate(new Date(scores.outcome.game.date))}<br />
            {scores.outcome.game.home_team}-{scores.outcome.game.visitor_team} <br />
            <p>Game result: {scores.outcome.goals_home}-{scores.outcome.goals_visitor} </p>
            <hr />
            <p>User: {scores.user.username}</p>
            <p>Bet: {usersBet(scores.user, scores.outcome)} </p>
            <p>Initial points: {points} </p>
            <hr />
            <form onSubmit={scoresEdition}>
              <br />
              <div>
                <strong>Edit the points:</strong> <br />
                <br />
                <input
                  type="number"
                  value={points}
                  onChange={({ target }) => setPoints(target.value)}
                  min="0"
                />
              </div><br />
              <button type="submit">Save</button>
              <button type="button" onClick={handleGoBackClick}>Cancel</button>
              <br />
              <br />
            </form>
          </div>
        </div>

      ) : (
        <>
          <p>There are no points to edit in the selected game for this user</p><br />
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default EditScoresForm;