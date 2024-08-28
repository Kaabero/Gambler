import { useState, useEffect } from 'react';
import { Outcome, User } from "../types";
import { getAllOutcomes, removeOutcome } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { AxiosError } from 'axios';

interface GameResultsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User
}

const GameResults: React.FC<GameResultsProps> = ({ user, setErrorMessage, setNotificationMessage }) => {

  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }
  ]);

  useEffect(() => {
    getAllOutcomes().then((data: React.SetStateAction<Outcome[]>) => {
      setOutcomes(data);
    });
  }, []);

  const handleRemoveResultClick = async (id: string) => {
    try {
      await removeOutcome(id);
      setOutcomes(outcomes.filter(outcome => outcome.id !== id));
      setNotificationMessage('Result and related scores deleted successfully!');
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
      <h2>Results</h2>
      <ul>
        {outcomes.map(outcome =>
          <li key={outcome.id}>
            <strong>Game: </strong><br />
            <br />
            <div>
              {formatDate(new Date(outcome.game.date))}<br />
              {outcome.game.home_team}-{outcome.game.visitor_team} <br />
              <br />
            </div>
            <strong>Result:</strong> <br />
            {outcome.goals_home} - {outcome.goals_visitor} <br />
            <br />
            {user.admin &&(
              <>
                <button onClick={() => handleRemoveResultClick(outcome.id)}>Delete the result and related scores</button>
              </>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default GameResults;