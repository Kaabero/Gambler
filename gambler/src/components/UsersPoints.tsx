import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Scores, Tournament, Bet, Outcome } from '../types';
import React from 'react';
import { getUserById } from '../services/userService';
import { formatDate } from '../utils/dateUtils';
import { removeScores, getAllScores } from '../services/scoreService';
import { getTournamentById } from '../services/tournamentService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAllBets } from '../services/betService';


interface UsersPointsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User,
  selectedTournament: string;
}

const UsersPoints: React.FC<UsersPointsProps> = ( { selectedTournament, loggedUser, setErrorMessage, setNotificationMessage }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User>(
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  );
  const [scores, setScores] = useState<Scores[]>([]);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
  );
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setTournament(data);
      });
    }
  }, [selectedTournament]);


  useEffect(() => {
    if (userId) {
      getUserById(userId).then(setUser);
    }
  }, [userId]);

  useEffect(() => {
    getAllScores().then((data) => {
      setScores(data);
    });
  }, []);

  const filteredScores = scores.filter(
    (score) => score.user && score.user.id === user.id
  );

  useEffect(() => {
    getAllBets().then((data) => {
      setBets(data);
    });
  }, []);


  const handleRemovePoints = async (id: string) => {
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

  const handleEditPointsClick = (scores: Scores) => {
    navigate(`/editScores/${scores.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };


  const sortedScores = [...filteredScores].sort((a, b) => new Date(a.outcome.game.date).getTime() - new Date(b.outcome.game.date).getTime());

  const tournamentScores = sortedScores.filter(score => score.outcome.game.tournament?.id === tournament.id);

  const usersBet = (user: User, outcome: Outcome): string => {
    const bet = bets.find(
      (bet) => bet.user && bet.user.id === user.id && bet.game.id === outcome.game.id
    );
    return `${bet?.goals_home}-${bet?.goals_visitor}`;
  };

  return (
    <div>
      <hr />

      {tournamentScores?.length > 0 ? (
        <>
          <h2>{user.username}'s points in tournament {tournament.name}</h2>
          <ul>
            {tournamentScores.map(score => <li key={score.id}>
              <hr />
              <strong>Game: </strong><br />
              <br />
              {formatDate(new Date(score.outcome.game.date))}<br />
              <br />
              {score.outcome.game.home_team}-{score.outcome.game.visitor_team} <br />
              <br />
              <strong>Result:</strong> {score.outcome.goals_home}-{score.outcome.goals_visitor} <br />
              <br />

              <strong>Bet:</strong> {usersBet(score.user, score.outcome)}<br />
              <br />
              <strong>Points:</strong> {score.points}<br />
              <br />
              {loggedUser.admin && (
                <>
                  <button onClick={() => handleRemovePoints(score.id)}>Delete points</button>
                  <button onClick={() => handleEditPointsClick(score)}>Edit points</button>
                </>
              )}
            </li>
            )}
          </ul>
        </>
      ) : (
        <>
          <h2>User's points</h2>
          <p>There are no points in the selected tournament for this user</p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default UsersPoints;