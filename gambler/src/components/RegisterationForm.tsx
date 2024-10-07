import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createUser } from '../services/userService';


interface RegisterationProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const RegisterationForm: React.FC<RegisterationProps> = ({
  setErrorMessage,
  setNotificationMessage
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleRegisteration = async (
    event: { preventDefault: () => void; }) => {
    event.preventDefault();

    try {
      const user = await createUser({
        username, password, admin: false
      });
      setUsername('');
      setPassword('');
      setNotificationMessage(`New user ${user.username} created successfully!`);
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/login');
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
      } else {
        setErrorMessage('An unknown error occurred');
      }
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };
  return (
    <div>
      <h2>Create account</h2>
      <hr />
      <form onSubmit={handleRegisteration}>
        <div>
          <p>Username:</p>
          <input
            data-testid="username"
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <p>Password:</p>
          <input
            data-testid="password"
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <br />
        <button id = "register-button" type="submit">Create account</button>
        <br />
        <br />
      </form>
      <hr />
    </div>
  );
};

export default RegisterationForm;