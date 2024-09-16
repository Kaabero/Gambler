import { useState, useEffect } from 'react';
import { User, Scores, Tournament, Bet } from '../types';
import { getAllUsers, removeUser } from '../services/userService';
import { getAllScores } from '../services/scoreService';
import React from 'react';
import { getAllBets } from '../services/betService';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { getTournamentById } from '../services/tournamentService';
import { getUserById } from '../services/userService';
import { editUser } from '../services/userService';


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
    { id: '1', name: 'TestTournament', from_date: new Date(), to_date: new Date() }
  );
  const [bets, setBets] = useState<Bet[]>([]);
  const [showOnlyUsersWithBets, setShowOnlyUsersWithBets] = useState(true);
  const [showAdminTools, setShowAdminTools] = useState(false);
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

  const handleRemoveUserClick = async (id: string) => {
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

  const handleCheckBetsClick = (user: User) => {

    navigate(`/bets/${user.id}`);
  };

  const handleCheckPointsClick = (user: User) => {

    navigate(`/points/${user.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const filteredUsers = users.filter(user =>
    !showOnlyUsersWithBets || getTotalBets(user) > 0
  );

  const handleRadioChangeBets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setShowOnlyUsersWithBets(value === 'withbets');
  };

  const handleRadioChangeAdmin = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setShowAdminTools(value === 'showadmin');
  };


  const handleManageAdminRightsClick = async (id: string, operation: string ) => {

    const user = await getUserById(id);

    let adminrights = user.admin;

    if (operation === 'removeadmin') {
      adminrights = false;
    }

    if (operation === 'makeadmin') {
      adminrights = true;
    }

    if (user) {
      const updatedUser: User = {
        ...user,
        admin: adminrights,
      };

      try {
        await editUser(id, updatedUser);

        setUsers((initialUsers) =>
          initialUsers.map((user) => (user.id === id ? updatedUser : user))
        );

        setNotificationMessage('User updated successfully!');
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
      setErrorMessage('No user found.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }
  };


  return (
    <div>
      <hr />
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
      <h2>Users</h2>
      <div>
        <label>
          <input
            type="radio"
            value="withbets"
            checked={showOnlyUsersWithBets}
            onChange={handleRadioChangeBets}
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
            onChange={handleRadioChangeBets}
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
              <button onClick={() => handleCheckBetsClick(user)}>Check bets</button>
              <button onClick={() => handleCheckPointsClick(user)}>Check received points</button>
              {loggedUser.admin && !user.admin && showAdminTools &&(
                <>
                  <button onClick={() => handleRemoveUserClick(user.id)}>Delete user</button> <br />
                  <button onClick={() => handleManageAdminRightsClick(user.id, 'makeadmin')}>Give admin rights</button> <br />
                  <br />
                  <br />
                </>
              )}
              {loggedUser.admin && user.admin && showAdminTools &&(
                <>
                  <button onClick={() => handleManageAdminRightsClick(user.id, 'removeadmin')}>Remove admin rights</button> <br />
                  <br />
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