import { useState, useEffect } from 'react';
import { Outcome, User, Scores, Tournament } from '../types';
import { getAllOutcomes } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { removeScores } from '../services/scoreService';
import { AxiosError } from 'axios';
import { getTournamentById } from '../services/tournamentService';

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

  return (
    <div>
      <hr />
      <h2>Received points</h2>
      {filteredOutcomes.length > 0 && (
        <>

          <ul>
            {filteredOutcomes.map((outcome) => (
              <li key={outcome.id}>
                <hr />
                <strong>Tournament: </strong> {outcome.game.tournament?.name}<br />
                <br />
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

                {outcome.scores?.map((score) => (
                  <div key={score.id}>
                    <strong>User:</strong> {score.user.username}<br />
                    <br />
                    <strong>Points:</strong> {score.points}
                    <br />
                    <br />
                    { loggedUser.admin && (
                      <>
                        <button onClick={() => handleRemovePoints(score.id)}>Delete points</button>
                        <button onClick={() => handleEditPointsClick(score)}>Edit points</button>
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
      {filteredOutcomes.length === 0 && (
        <>
          <p> There are no points added to selected tournament</p>
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default Points;