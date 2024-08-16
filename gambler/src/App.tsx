import { useState } from 'react';
import { Credentials } from "./types";
import React from 'react';
import Notification from './components/Notification'
import GameForm from './components/GameForm';
import Bets from './components/Bets';
import Login from './components/Login';
import Games from './components/Games';
import Users from './components/Users';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom"

const App = () => {
  const [errormessage, setErrorMessage] = useState('');
  const [notificationmessage, setNotificationMessage] = useState('');
  const [user, setUser] = useState<Credentials|null>();
  
  const padding = {
    padding: 5
  }

  return (
    <div>
      <Notification errormessage={errormessage} notificationmessage={notificationmessage} />


      <Router>
      <div>
        <Link style={padding} to="/addGame">Add game</Link>
        <Link style={padding} to="/bets">Bets</Link>
        <Link style={padding} to="/players">Players</Link>
        <Link style={padding} to="/">Home</Link>
        {user ? (
          <em>{user.username} logged in</em>
        ) : (
          <Link style={padding} to="/login">Login</Link>
        )}
      </div>

      <Routes>
        <Route path="/bets" element={<Bets />} />
        <Route path="/players" element={<Users />} />
        <Route path="/" element={<Games />} />
        <Route
          path="/"
          element={user ? "/" : <Navigate replace to="/login" />}
        />
        <Route path="/login" element={<Login setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} setUser={setUser}/>} />
        <Route path="/addGame" element={<GameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;
