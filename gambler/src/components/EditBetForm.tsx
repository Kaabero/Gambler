import { useState } from 'react';
import { Bet } from "../types";
import React from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';


interface EditBetFormProps {
  bet: Bet;
  onSave: (updatedBet: Bet) => void;
  onCancel: () => void;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setEditingBet: React.Dispatch<React.SetStateAction<Bet | null>>;
}

const EditBetForm: React.FC<EditBetFormProps> = ({ bet, setEditingBet, onSave, onCancel, setErrorMessage, setNotificationMessage }) => {
  const [visitorGoals, setVisitorGoals] = useState(bet.goals_visitor);
  const [homeGoals, setHomeGoals] = useState(bet.goals_home);
  const navigate = useNavigate();

  const betEdition = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      const updatedBet: Bet = {
        ...bet,
        goals_home: homeGoals || bet.goals_home,
        goals_visitor: visitorGoals || bet.goals_visitor,
      };

      setErrorMessage('');
      await onSave(updatedBet);
      setNotificationMessage('Bet edited successfully!');
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
      setEditingBet(null);
    }
  };

  return (
    <div>
      <h2>Edit the bet</h2>
      <form onSubmit={betEdition}>
        <br />
        <div>
          Home Team Goals:
          <br />
          <input
            type="number"
            value={homeGoals}
            onChange={({ target }) => setHomeGoals(target.value)}
          />
        </div>
        <br />
        <div>
          Visitor Team:
          <br />
          <input
            type="number"
            value={visitorGoals}
            onChange={({ target }) => setVisitorGoals(target.value)}
          />
        </div>
        <br />
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default EditBetForm;