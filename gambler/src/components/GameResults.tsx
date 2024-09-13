import { useState, useEffect } from 'react';
import { Outcome, User, Tournament } from '../types';
import { getAllOutcomes, removeOutcome } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getTournamentById } from '../services/tournamentService';

interface GameResultsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User,
  selectedTournament: string
}

const GameResults: React.FC<GameResultsProps> = ({ selectedTournament, user, setErrorMessage, setNotificationMessage }) => {
  const navigate = useNavigate();
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { id: '1', goals_home: '1', goals_visitor: '1', game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }
  ]);

  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
  );

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then(setTournament);
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllOutcomes().then((data: React.SetStateAction<Outcome[]>) => {
      setOutcomes(data);
    });
  }, []);

  const handleRemoveResultClick = async (id: string) => {
    if (confirm('Deleting game result will also remove related scores!')) {
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
    } else {
      return;
    }
  };

  const handleCheckPoints = (outcome: Outcome) => {

    navigate(`/gamespoints/${outcome.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const sortedOutcomes = [...outcomes].sort((a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const filteredOutcomes = sortedOutcomes.filter(
    (outcome) => outcome.game.tournament && outcome.game.tournament.id === tournament.id
  );

  return (
    <div>
      <hr />
      {filteredOutcomes && filteredOutcomes?.length > 0 && (
        <>
          <h2>Results in tournament {tournament.name}</h2>
          <ul>
            {filteredOutcomes.map(outcome =>
              <li key={outcome.id}>
                <hr />
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
                <button onClick={() => handleCheckPoints(outcome)}>Check received points</button>
                {user.admin &&(
                  <>
                    <button onClick={() => handleRemoveResultClick(outcome.id)}>Delete the result and related scores</button>
                  </>
                )}
              </li>
            )}
          </ul>
        </>
      )}
      {!filteredOutcomes || filteredOutcomes?.length === 0 && (
        <>
          <h2>Results</h2>
          <p> There are no game results added to selected tournament</p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GameResults;