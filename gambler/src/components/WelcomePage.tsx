import React from 'react';
import { useState, useEffect } from 'react';

import { getAllUsers } from '../services/userService';
import { User } from '../types';




const Home = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  ]);

  useEffect(() => {
    getAllUsers().then((data: User[]) => {
      setUsers(data);
    });
  }, []);

  const admins = users.filter((user) => user.admin === true);

  return (
    <div>
      <hr />
      <h2>Welcome to the Gambler app!</h2>

      <div>
        You can now compete with your betting group for the title of the best score predictor! <br />
        <br />
        Select your preferred tournament from the menu, view the tournament's games, and add your own predictions. <br />
        <br />
        If you guess the correct result, you will earn three points. If you guess the correct winner or predict a draw, you will receive one point. <br />
        <br />
        You can also view the game results, your own and others' bets, as well as your own and others' point balances. <br />
        <br />
        Administrators can manage tournaments, games, results, points, bets and users within the app. <br />
        <br />
        The current administrators are:
        <ul>
          {admins.map(admin =>
            <li key={admin.id}>
              <>{admin.username}</><br />
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;