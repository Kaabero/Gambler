import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllBets } from '../services/betService';
import { getAllOutcomes } from '../services/outcomeService';
import { getTournamentById } from '../services/tournamentService';
import { Outcome, User, Scores, Tournament, Bet } from '../types';
import { formatDate } from '../utils/dateUtils';

interface PointsProps {
    loggedUser: User,
    selectedTournament: string
  }


const Points: React.FC<PointsProps> = ( { selectedTournament, loggedUser }) => {
  const navigate = useNavigate();
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1',
      name: 'TestTournament',
      from_date: new Date(),
      to_date: new Date() }
  );
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then(setTournament);
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllOutcomes().then((data) => {
      setOutcomes(data);
    });
  }, []);

  useEffect(() => {
    getAllBets().then((data) => {
      setBets(data);
    });
  }, []);


  const handleEditPointsClick = (scores: Scores) => {
    navigate(`/editScores/${scores.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const outcomesWithScores = outcomes
    .filter((outcome) => !outcome.scores || outcome.scores.length > 0);

  const sortedOutcomes = [...outcomesWithScores]
    .sort((a, b) =>
      new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const filteredOutcomes = sortedOutcomes
    .filter(
      (outcome) =>
        outcome.game.tournament && outcome.game.tournament.id === tournament.id
    );

  const usersBet = (user: User, outcome: Outcome): string => {
    const bet = bets
      .find((bet) =>
        bet.user && bet.user.id === user.id && bet.game.id === outcome.game.id
      );
    return `${bet?.goals_home}-${bet?.goals_visitor}`;
  };

  const handleRadioChangeAdmin = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAdminTools(value === 'showadmin');
  };


  return (
    <div>
      <hr />
      {filteredOutcomes.length > 0 && (
        <>
          {loggedUser.admin && (
            <>
              <div>
                <label>
                  <input
                    type="radio"
                    value="hideadmin"
                    checked={!showAdminTools}
                    onChange={handleRadioChangeAdmin}
                  />
              Hide admin tools
                </label>
              </div>
              <div>
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
          <h2>Received points in tournament {tournament.name}</h2>
          <ul>
            {filteredOutcomes.map((outcome) => (
              <li key={outcome.id}>
                <hr />
                <strong>Game: </strong> <br />
                <br />
                {formatDate(new Date(outcome.game.date))}
                <br />
                {outcome.game.home_team} - {outcome.game.visitor_team}<br />
                <br />
                <strong>Game result: </strong>
                {outcome.goals_home} - {outcome.goals_visitor}
                <br />
                <br />
                <ul>

                  {outcome.scores?.map((score) => (
                    <li key={score.id}>
                      <strong>Points to user {score.user.username}: </strong>
                      {score.points}
                      <br />
                      <strong>Users bet: </strong>
                      {usersBet(score.user, outcome)} <br />
                      <br />
                      { loggedUser.admin && showAdminTools && (
                        <>
                          <button onClick={() =>
                            handleEditPointsClick(score)}>
                              Edit points
                          </button><br />
                          <br />
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
      {filteredOutcomes.length === 0 && (
        <>
          <h2>Received points</h2>
          <p> There are no points received from selected tournament</p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default Points;