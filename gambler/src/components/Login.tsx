import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginService from '../services/loginService';
import { Credentials } from '../types';
import { setToken } from '../utils/setToken';


interface LoginFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
}

const Login: React.FC<LoginFormProps> = ({ setErrorMessage, setNotificationMessage, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleLogin = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    try {
      const user = await loginService.login({
        username, password,
      });
      window.localStorage.setItem(
        'loggedGamblerappUser', JSON.stringify(user)
      );

      setToken(user.token);
      setUser(user);
      setUsername('');
      setPassword('');
      setNotificationMessage('Login successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (exception) {
      setErrorMessage('wrong credentials');
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };
  return (
    <div>
      <div>
        <hr />
        <h2>Welcome to the Gambler app!</h2>

        <div>
          You can now compete with your betting group for the title of the best score predictor! <br />
          <br />
          Log in to select your preferred tournament from the menu, view the tournament's games, and add your predictions. <br />
          <br />
          If you haven't registered yet, create an account to get started! <br />
          <br />
          <hr />

        </div>
      </div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          Username:
          <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password:
          <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <br />
        <button type="submit">Login</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default Login;