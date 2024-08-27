import { useState, useEffect } from 'react';
import { User, Scores } from "../types";
import { getAllUsers } from '../services/userService';
import { getAllScores } from '../services/scoreService';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Users = () => {
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

  const getTotalPoints = (user: User): number => {
    return scores
      .filter(score => score.user.id === user.id)
      .reduce((total, score) => total + parseInt(score.points), 0);
  };

  const handleCheckBets = (user: User) => {

    navigate(`/bets/${user.id}`);
  };

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.username}</strong><br />
            Total points: {getTotalPoints(user)}
            <br />
            <button onClick={() => handleCheckBets(user)}>Check bets</button> <br />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;