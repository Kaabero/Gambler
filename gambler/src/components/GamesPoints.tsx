import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Outcome, User, Scores } from "../types";
import React from 'react';
import { getOutcomeById } from '../services/outcomeService';
import { formatDate } from '../utils/dateUtils';
import { removeScores, editScores } from '../services/scoreService';
import { AxiosError } from 'axios';
import EditScoresForm from './EditScoresForm';


interface GamesPointsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User
}

const GamesPoints: React.FC<GamesPointsProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
  const { outcomeId } = useParams();
  const [outcome, setOutcome] = useState<Outcome>(
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }
  );
  const [scores, setScores] = useState<Scores[]>([]);
  const [editingScores, setEditingScores] = useState<Scores | null>(null);


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

  const handleUpdateScores = async (updatedScores: Scores) => {
    const editedScores = await editScores(updatedScores.id, updatedScores);
    setOutcome((outcome) => ({
      ...outcome,
      scores: outcome.scores?.map(score =>
        score.id === updatedScores.id ? editedScores : score
      ),
    }));

    setEditingScores(null);
  };


  const handleRemoveScores = async (id: string) => {
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
  return (
    <div>
      <strong>Game: </strong><br />
      <br />
      <div>
        {formatDate(new Date(outcome.game.date))}<br />
        {outcome.game.home_team}-{outcome.game.visitor_team} <br />
      </div>
      {outcome.scores && outcome.scores?.length > 0 && (
        <>
          <ul>
            {scores.map(scores =>
              <li key={scores.id}>
                <strong>User:</strong> {scores.user.username}<br />
                <br />
                <strong>Points: </strong> {scores.points}<br />
                <br />
                { loggedUser.admin && (
                  <>
                    <button onClick={() => handleRemoveScores(scores.id)}>Delete points</button>
                    <button onClick={() => setEditingScores(scores)}>Edit points</button><br />
                    <hr />
                  </>
                )}
              </li>
            )}
          </ul>
        </>
      )}
      {!outcome.scores || outcome.scores?.length === 0 && (
        <>
          <br />
          <strong> There are no scores for this game </strong>
        </>
      )}
      {editingScores && (
        <EditScoresForm
          scores={editingScores}
          setErrorMessage={setErrorMessage}
          setNotificationMessage={setNotificationMessage}
          onSave={handleUpdateScores}
          onCancel={() => setEditingScores(null)}
          setEditingScores={setEditingScores}
        />
      )}
    </div>

  );
};

export default GamesPoints;