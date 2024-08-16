import { useState, useEffect } from 'react';
import { Game } from "./types";
import { getAllGames } from './gameService';
import React from 'react';
import Notification from './components/Notification'
import GameForm from './components/GameForm';
import Bets from './components/Bets';
import Login from './components/Login';
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
  const [games, setGames] = useState<Game[]>([
    { id: 1, date: '1.1.2023', home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  ]);

  useEffect(() => {
    getAllGames().then(data => {
      setGames(data);
    });
  }, []);

  const user= null

  const padding = {
    padding: 5
  }

  return (
    <div>
      <h2>Games</h2>
      <Notification errormessage={errormessage} notificationmessage={notificationmessage} />
      <ul>
        {games.map(game =>
          <li key={game.id}>
            <strong>{game.date}</strong><br />
            Home Team: {game.home_team} <br />
            Visitor Team: {game.visitor_team} <br />
            <br />
          </li>
        )}
      </ul>

      <Router>
      <div>
        <Link style={padding} to="/addGame">Add game</Link>
        <Link style={padding} to="/bets">Bets</Link>
        <Link style={padding} to="/players">Players</Link>
        {user ? (
          <em>{user} logged in</em>
        ) : (
          <Link style={padding} to="/login">login</Link>
        )}
      </div>

      <Routes>
        <Route path="/bets" element={<Bets />} />
        <Route
          path="/players"
          element={user ? <Users /> : <Navigate replace to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/addGame" element={<GameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;
