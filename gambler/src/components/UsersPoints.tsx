import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Scores, Tournament } from '../types';
import React from 'react';
import { getUserById } from '../services/userService';
import { formatDate } from '../utils/dateUtils';
import { removeScores, getAllScores } from '../services/scoreService';
import { getTournamentById } from '../services/tournamentService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';


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

  return (
    <div>
      <hr />
      <h2>User: {user.username}</h2>
      {tournamentScores?.length > 0 ? (
        <ul>
          {tournamentScores.map(score => <li key={score.id}>
            <hr />
            <strong>Game: </strong><br />
            <br />
            <div>
              {formatDate(new Date(score.outcome.game.date))}<br />
              <br />
              {score.outcome.game.home_team}-{score.outcome.game.visitor_team} <br />
              <br />
              Result: {score.outcome.goals_home}-{score.outcome.goals_visitor} <br />
              <br />
            </div>
            <strong>Scores:</strong> {score.points}<br />
            <br />
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
      ) : (
        <>
          <p>There are no points in the selected tournament for this user</p>
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default UsersPoints;