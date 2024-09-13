import { useState, useEffect } from 'react';
import { User, Scores, Tournament, Bet } from '../types';
import { getAllUsers, removeUser } from '../services/userService';
import { getAllScores } from '../services/scoreService';
import React from 'react';
import { getAllBets } from '../services/betService';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { getTournamentById } from '../services/tournamentService';


interface UsersProps {
  loggedUser: User;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedTournament: string
}

const Users: React.FC<UsersProps> = ({ selectedTournament, loggedUser, setErrorMessage, setNotificationMessage }) => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  ]);

  const [scores, setScores] = useState<Scores[]>([
    { id: '1', points: '0', outcome: { id: '1', goals_home: '1', goals_visitor: '1', game: { id: '1', date: new Date(), home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }, user: { id: '1', username: 'TestUser', password: 'Password', admin: false } }
  ]);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
  );
  const [bets, setBets] = useState<Bet[]>([]);

  const [showOnlyUsersWithBets, setShowOnlyUsersWithBets] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then(setTournament);
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllUsers().then((data: User[]) => {
      setUsers(data);
    });
  }, []);

  useEffect(() => {
    getAllScores().then((data: Scores[]) => {
      setScores(data);
    });
  }, []);

  useEffect(() => {
    getAllBets().then((data: Bet[]) => {
      setBets(data);
    });
  }, []);

  const handleRemoveUser = async (id: string) => {
    if (confirm('Deleting user will also remove related bets and scores in all tournaments!')) {
      try {
        await removeUser(id);
        setUsers(users.filter(user => user.id !== id));
        setNotificationMessage('User deleted successfully!');
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

  const getTotalPoints = (user: User): number => {
    return scores
      .filter(score => score.user.id === user.id && score.outcome.game.tournament?.id===tournament.id)
      .reduce((total, score) => total + parseInt(score.points), 0);
  };

  const getTotalBets = (user: User): number => {
    const filteredBets= bets.filter(bet => bet.user.id === user.id && bet.game.tournament?.id===tournament.id);
    return filteredBets.length;
  };

  const handleCheckBets = (user: User) => {

    navigate(`/bets/${user.id}`);
  };

  const handleCheckPoints = (user: User) => {

    navigate(`/points/${user.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const filteredUsers = users.filter(user =>
    !showOnlyUsersWithBets || getTotalBets(user) > 0
  );

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setShowOnlyUsersWithBets(value === 'withbets');
  };


  return (
    <div>
      <hr />
      <h2>Users</h2>
      <div>
        <label>
          <input
            type="radio"
            value="withbets"
            checked={showOnlyUsersWithBets}
            onChange={handleRadioChange}
          />
                Show only users with bets in selected tournament
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="all"
            checked={!showOnlyUsersWithBets}
            onChange={handleRadioChange}
          />
                Show all users
        </label>
      </div>

      {filteredUsers.length > 0 ? (
        <ul>
          {filteredUsers.map(user => (
            <li key={user.id}>
              <hr />
              <strong>Username: </strong>{user.username}<br />
              <br />
              {tournament.id!=='1' &&(
                <>
                  <p>Total points for tournament {tournament.name}: {getTotalPoints(user)}</p>
                  <p>Total bets for tournament {tournament.name}: {getTotalBets(user)}</p>
                </>
              )}
              {tournament.id==='1' &&(
                <>
                  <p>Total points for selected tournament: {getTotalPoints(user)}</p>
                  <p>Total bets for selected tournament: {getTotalBets(user)}</p>
                </>
              )}
              <button onClick={() => handleCheckBets(user)}>Check bets</button>
              <button onClick={() => handleCheckPoints(user)}>Check received points</button>
              {loggedUser.admin && !user.admin &&(
                <>
                  <button onClick={() => handleRemoveUser(user.id)}>Delete user</button> <br />
                  <br />
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <hr />
          <p> There are no users with bets in selected tournament </p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default Users;