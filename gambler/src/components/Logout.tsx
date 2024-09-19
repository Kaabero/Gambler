import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Credentials } from '../types';
import { setToken } from '../utils/setToken';

interface LogoutProps {
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTournament: React.Dispatch<React.SetStateAction<string>>;
}

const Logout: React.FC<LogoutProps> = ({ setSelectedTournament, setNotificationMessage, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    setToken('');
    window.localStorage.clear();
    setNotificationMessage('You are logged out');
    setTimeout(() => {
      setNotificationMessage('');
    }, 3000);
    setSelectedTournament('');
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
