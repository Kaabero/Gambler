import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllOutcomes, removeOutcome } from '../services/outcomeService';
import { getTournamentById } from '../services/tournamentService';
import { Outcome, User, Tournament } from '../types';
import { formatDate } from '../utils/dateUtils';

interface GameResultsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User,
  selectedTournament: string
}

const GameResults: React.FC<GameResultsProps> = ({
  selectedTournament,
  loggedUser,
  setErrorMessage,
  setNotificationMessage }) => {
  const navigate = useNavigate();
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { id: '1',
      goals_home: '1',
      goals_visitor: '1',
      game: {
        id: '1',
        date: new Date() ,
        home_team: 'HomeTeam',
        visitor_team: 'VisitorTeam' } }
  ]);

  const [tournament, setTournament] = useState<Tournament>(
    { id: '1',
      name: 'TestTournament',
      from_date: new Date(),
      to_date: new Date() }
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
        setNotificationMessage(
          'Result and related scores deleted successfully!'
        );
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

  const handleRadioChangeAdmin = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAdminTools(value === 'showadmin');
  };

  const sortedOutcomes = [...outcomes]
    .sort((a, b) =>
      new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const filteredOutcomes = sortedOutcomes
    .filter((outcome) =>
      outcome.game.tournament && outcome.game.tournament.id === tournament.id
    );

  return (
    <div>
      <hr />
      {filteredOutcomes && filteredOutcomes?.length > 0 && (
        <>
          <h2>Results in tournament {tournament.name}</h2>
          {loggedUser.admin && (
            <>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="hideadmin"
                    checked={!showAdminTools}
                    onChange={handleRadioChangeAdmin}
                  />
              Hide admin tools
                </label>
                <label>
                  <input
                    type="radio"
                    value="showadmin"
                    checked={showAdminTools}
                    onChange={handleRadioChangeAdmin}
                  />
              Show admin tools
                </label>
              </div>
              <hr />
            </>
          )}
          <ul>
            {filteredOutcomes.map(outcome =>
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
                <button onClick={() =>
                  handleCheckPoints(outcome)}>
                    Check received points
                </button>
                {loggedUser.admin && showAdminTools && (
                  <>
                    <button className= 'admin-button' onClick={() =>
                      handleRemoveResultClick(outcome.id)}>
                        Delete the result and related scores
                    </button>
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
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default GameResults;