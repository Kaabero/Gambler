import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import MainComponent from './components/MainComponent';
import Notification from './components/Notification';
import { getAllTournaments } from './services/tournamentService';
import { Credentials, Tournament } from './types';
import { setToken } from './utils/setToken';

const App = () => {
  const [errormessage, setErrorMessage] = useState('');
  const [notificationmessage, setNotificationMessage] = useState('');
  const [user, setUser] = useState<Credentials | null>();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedGamblerappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      setToken(user.token);
    }
  }, []);

  useEffect(() => {
    getAllTournaments().then(data => {
      setTournaments(data);
    });
  }, []);

  return (
    <Router>
      <Notification
        errormessage={errormessage}
        notificationmessage={notificationmessage}
      />
      <MainComponent
        setTournaments={setTournaments}
        errormessage={errormessage}
        notificationmessage={notificationmessage}
        user={user}
        setUser={setUser}
        tournaments={tournaments}
        selectedTournament={selectedTournament}
        setSelectedTournament={setSelectedTournament}
        setErrorMessage={setErrorMessage}
        setNotificationMessage={setNotificationMessage}
      />
    </Router>
  );
};

export default App;
