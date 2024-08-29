import { useState } from 'react';
import { Scores } from '../types';
import React from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';


interface EditScoresFormProps {
  scores: Scores;
  onSave: (updatedBet: Scores) => void;
  onCancel: () => void;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setEditingScores: React.Dispatch<React.SetStateAction<Scores | null>>;
}

const EditScoresForm: React.FC<EditScoresFormProps> = ({ scores, setEditingScores, onSave, onCancel, setErrorMessage, setNotificationMessage }) => {
  const [points, setPoints] = useState(scores.points);
  const navigate = useNavigate();

  const scoresEdition = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      const updatedScores: Scores = {
        ...scores,
        points: points || scores.points
      };

      setErrorMessage('');
      await onSave(updatedScores);
      setNotificationMessage('Scores edited successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/');

    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
      setEditingScores(null);
    }
  };

  return (
    <div>
      <h2>Edit the scores</h2>
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
        <button type="button" onClick={onCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default EditScoresForm;