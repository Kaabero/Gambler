import { useState, useEffect } from 'react';
import { User, Scores } from "../types";
import { getAllUsers, removeUser } from '../services/userService';
import { getAllScores } from '../services/scoreService';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';


interface UsersProps {
  loggedUser: User;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Users: React.FC<UsersProps> = ({ loggedUser, setErrorMessage, setNotificationMessage }) => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  ]);

  const [scores, setScores] = useState<Scores[]>([
    { id: '1', points: '0', outcome: { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date(), home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }, user: { id: '1', username: 'TestUser', password: 'Password', admin: false } }
  ]);

  const navigate = useNavigate();

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

  const handleRemoveUser = async (id: string) => {
    if (confirm('Deleting user will also remove related bets and scores!')) {
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
      .filter(score => score.user.id === user.id)
      .reduce((total, score) => total + parseInt(score.points), 0);
  };

  const handleCheckBets = (user: User) => {

    navigate(`/bets/${user.id}`);
  };

  const handleCheckPoints = (user: User) => {

    navigate(`/points/${user.id}`);
  };

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <hr />
            <strong>Player: </strong>{user.username}<br />
            <strong>Total points: </strong> {getTotalPoints(user)}<br />
            <br />
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
    </div>
  );
};

export default Users;