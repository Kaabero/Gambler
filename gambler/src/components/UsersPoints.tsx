import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Scores } from '../types';
import React from 'react';
import { getUserById } from '../services/userService';
import { formatDate } from '../utils/dateUtils';
import { removeScores, editScores } from '../services/scoreService';
import { AxiosError } from 'axios';
import EditScoresForm from './EditScoresForm';


interface UsersPointsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User
}

const UsersPoints: React.FC<UsersPointsProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
  const { userId } = useParams();
  const [user, setUser] = useState<User>(
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  );
  const [editingScores, setEditingScores] = useState<Scores | null>(null);
  const [scores, setScores] = useState<Scores[]>([]);


  useEffect(() => {
    if (userId) {
      getUserById(userId).then(setUser);
    }
  }, [userId]);

  useEffect(() => {
    if (user && user.scores) {
      setScores(user.scores);
    }
  }, [user]);


  const handleRemoveScores = async (id: string) => {
    try {
      await removeScores(id);
      setScores(scores.filter(score => score.id !== id));
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
    setScores(scores.map(score => score.id === updatedScores.id ? editedScores : score));
    setEditingScores(null);
  };

  const sortedScores = [...scores].sort((a, b) => new Date(a.outcome.game.date).getTime() - new Date(b.outcome.game.date).getTime());

  return (
    <div>
      <h3>User: {user.username}</h3>
      {scores && scores?.length > 0 && (
        <>
          <ul>
            {sortedScores.map(score =>
              <li key={score.id}>
                <hr />
                <strong>Game: </strong><br />
                <br />
                <div>
                  {formatDate(new Date(score.outcome.game.date))}<br />
                  <br />
                  {score.outcome.game.home_team}-{score.outcome.game.visitor_team} <br />
                  <br />
                  Result: {score.outcome.goals_home}-{score.outcome.goals_visitor} <br />
                  <br />
                </div>
                <strong>Scores:</strong> {score.points}<br />
                <br />
                <br />
                { loggedUser.admin && (
                  <>
                    <button onClick={() => handleRemoveScores(score.id)}>Delete points</button>
                    <button onClick={() => setEditingScores(score)}>Edit points</button>
                  </>
                )}
              </li>
            )}
          </ul>
        </>
      )}
      {!scores || scores?.length === 0 && (
        <>
          <br />
          <p> There are no scores for this user </p>
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

export default UsersPoints;