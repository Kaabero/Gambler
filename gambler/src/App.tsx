import { useState, useEffect } from 'react';
import { Credentials } from "./types";
import React from 'react';
import { setToken } from './utils/setToken';
import Notification from './components/Notification';
import GameForm from './components/GameForm';
import Bets from './components/Bets';
import GameResults from './components/GameResults';
import Login from './components/Login';
import Games from './components/Games';
import Users from './components/Users';
import AddBetForm from './components/AddBetForm';
import AddOutcomeForm from './components/AddOutcomeForm';
import CreateAccount from './components/RegisterationForm';
import GameResult from './components/GameResult';
import UsersBets from './components/UsersBets';
import GamesBets from './components/GamesBets';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

const App = () => {
  const [errormessage, setErrorMessage] = useState('');
  const [notificationmessage, setNotificationMessage] = useState('');
  const [user, setUser] = useState<Credentials|null>();

  const padding = {
    padding: 5
  };

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedGamblerappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      setToken(user.token);
    }
  }, []);

  return (
    <Router>
      <div>
        <Notification errormessage={errormessage} notificationmessage={notificationmessage} />

        <Routes>
          <Route path="/bets" element={user ? <Bets user={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/>: <Navigate replace to="/login" />} />
          <Route path="/results" element={user ? <GameResults user={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/>: <Navigate replace to="/login" />} />
          <Route path="/players" element={user ? <Users loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/> : <Navigate replace to="/login" />} />
          <Route path="/addGame" element={(user && user.admin) ? <GameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/" element={user ? <Games user={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/> : <Navigate replace to="/login" />} />
          <Route path="/bets/:userId" element={user ? <UsersBets loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/> : <Navigate replace to="/login" />} />
          <Route path="/gamesbets/:gameId" element={user ? <GamesBets loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/> : <Navigate replace to="/login" />} />
          <Route path="/register" element={!user ? <CreateAccount setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/login" element={!user ? <Login setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} setUser={setUser}/>: <Navigate replace to="/" />} />
          <Route path="/addBet/:gameId" element={user ? <AddBetForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/>: <Navigate replace to="/login" />} />
          <Route path="/addOutcome/:gameId" element={(user && user.admin) ? <AddOutcomeForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/>: <Navigate replace to="/" />} />
          <Route path="/result/:gameId" element={user ? <GameResult user={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage}/>: <Navigate replace to="/login" />} />
        </Routes>

        <div>

          {user && (
            <>
              <br />
              {user.admin ? <Link style={padding} to="/addGame">Add game</Link> : <></>}
              <Link style={padding} to="/bets">Bets</Link>
              <Link style={padding} to={`/bets/${user.id}`}>Check and manage your own bets</Link>
              <Link style={padding} to="/results">Game results</Link>
              <Link style={padding} to="/players">Players and points</Link>
              <Link style={padding} to="/">Home</Link>
              <br />
            </>
          )}
          {user ? (
            <p>{user.username} logged in
              <br />
              <br />
              <LogoutButton setUser={setUser} setNotificationMessage={setNotificationMessage} /></p>
          ) : (
            <><Link style={padding} to="/login">Login</Link><Link style={padding} to="/register">Create account</Link></>
          )}

        </div>
      </div>
    </Router>
  );
};

interface LogoutProps {
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}


const LogoutButton: React.FC<LogoutProps> = ({ setNotificationMessage, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    setToken('');

    window.localStorage.clear();
    setNotificationMessage('You are logged out');
    setTimeout(() => {
      setNotificationMessage('');
    }, 3000);
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default App;



