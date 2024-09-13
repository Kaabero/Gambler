import { useState, useEffect } from 'react';
import { Outcome, User, Scores, Tournament, Bet } from '../types';
import { getAllOutcomes } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { removeScores } from '../services/scoreService';
import { AxiosError } from 'axios';
import { getTournamentById } from '../services/tournamentService';
import { getAllBets } from '../services/betService';

interface PointsProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
    loggedUser: User,
    selectedTournament: string
  }


const Points: React.FC<PointsProps> = ( { selectedTournament, loggedUser, setErrorMessage, setNotificationMessage }) => {
  const navigate = useNavigate();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
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

  const handleRemovePoints = async (id: string) => {
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


  const handleEditPointsClick = (scores: Scores) => {
    navigate(`/editScores/${scores.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const outcomesWithScores = outcomes.filter((outcome) => !outcome.scores || outcome.scores.length > 0);

  const sortedOutcomes = [...outcomesWithScores].sort((a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const filteredOutcomes = sortedOutcomes.filter(
    (outcome) => outcome.game.tournament && outcome.game.tournament.id === tournament.id
  );

  const usersBet = (user: User, outcome: Outcome): string => {
    const bet = bets.find(
      (bet) => bet.user && bet.user.id === user.id && bet.game.id === outcome.game.id
    );
    return `${bet?.goals_home}-${bet?.goals_visitor}`;
  };


  return (
    <div>
      <hr />
      {filteredOutcomes.length > 0 && (
        <>
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
                      <strong>Users bet: </strong> {usersBet(score.user, outcome)} <br />
                      <br />
                      { loggedUser.admin && (
                        <>
                          <button onClick={() => handleRemovePoints(score.id)}>Delete points</button>
                          <button onClick={() => handleEditPointsClick(score)}>Edit points</button><br />
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