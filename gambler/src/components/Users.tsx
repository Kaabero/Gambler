import { useState, useEffect } from 'react';
import { User } from "../types";
import { getAllUsers } from '../services/userService';
import React from 'react';


const Users = () => {

  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  ]);

  useEffect(() => {
    getAllUsers().then((data: React.SetStateAction<User[]>) => {
      setUsers(data);
    });
  }, []);

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {users.map(user =>
          <li key={user.id}>
            <strong>{user.username}</strong><br />
            Admin: {user.admin ? `Yes` : `No`} <br />
            <br />
          </li>
        )}
      </ul>
    </div>
  );
};

export default Users;