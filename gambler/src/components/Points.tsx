import { useState, useEffect } from 'react';
import { Outcome, User, Scores } from "../types";
import { getAllOutcomes } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import EditScoresForm from './EditScoresForm';
import { removeScores, editScores } from '../services/scoreService';
import { AxiosError } from 'axios';

interface PointsProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
    loggedUser: User
  }


const Points: React.FC<PointsProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [editingScores, setEditingScores] = useState<Scores | null>(null);

  useEffect(() => {
    getAllOutcomes().then((data) => {
      setOutcomes(data);
    });
  }, []);

  const handleRemoveScores = async (id: string) => {
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

  const handleUpdateScores = async (updatedScores: Scores) => {
    const editedScores = await editScores(updatedScores.id, updatedScores);
    setOutcomes(
      outcomes.map(outcome => ({
        ...outcome,
        scores: outcome.scores?.map(score =>
          score.id === updatedScores.id ? editedScores : score
        ),
      }))
    );
    setEditingScores(null);
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

                {outcome.scores?.map((scores) => (
                  <div key={scores.id}>
                    <strong>User:</strong> {scores.user.username}<br />
                    <strong>Points:</strong> {scores.points}
                    <br />
                    <br />
                    { loggedUser.admin && (
                      <>
                        <button onClick={() => handleRemoveScores(scores.id)}>Delete points</button>
                        <button onClick={() => setEditingScores(scores)}>Edit points</button><br />
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
          <br />
          <p> There are no scores added </p>
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

export default Points;