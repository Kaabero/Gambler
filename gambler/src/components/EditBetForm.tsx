import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bet } from '../types';
import React from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { editBet, getBetById } from '../services/betService';
import { formatDate } from '../utils/dateUtils';



interface EditBetFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;

}

const EditBetForm: React.FC<EditBetFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { betId } = useParams<{ betId: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [visitorGoals, setVisitorGoals] = useState<string>('');
  const [homeGoals, setHomeGoals] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (betId) {
      getBetById(betId).then(bet => {
        setBet(bet);
        setVisitorGoals(bet.goals_visitor);
        setHomeGoals(bet.goals_home);
      });
    }
  }, [betId]);

  const betEdition = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (bet) {
      const updatedBet: Bet = {
        ...bet,
        goals_home: homeGoals || bet.goals_home,
        goals_visitor: visitorGoals || bet.goals_visitor,
      };

      try {
        await editBet(updatedBet.id, updatedBet);
        setNotificationMessage('Bet updated successfully!');
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
      setErrorMessage('No bet found.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }
  };


  const onCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      { bet && (
        <div>
          <h2>Edit the bet</h2>
          <p>Tournament: {bet.game.tournament?.name}  </p>
          {formatDate(new Date(bet.game.date))} <br />
          <form onSubmit={betEdition}>
            <br />
            <div>
         Goals for {bet.game.home_team}:
              <br />
              <input
                type="number"
                value={homeGoals}
                onChange={({ target }) => setHomeGoals(target.value)}
                min="0"
              />
            </div>
            <br />
            <div>
            Goals for {bet.game.visitor_team}:
              <br />
              <input
                type="number"
                value={visitorGoals}
                onChange={({ target }) => setVisitorGoals(target.value)}
                min="0"
              />
            </div>
            <br />
            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {!bet && (
        <>
          <br />
          <p> No bet selected for edition. </p>
        </>
      )}
    </div>
  );
};

export default EditBetForm;