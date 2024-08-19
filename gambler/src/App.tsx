import { useState, useEffect } from 'react';
import { Credentials } from "./types";
import React from 'react';
import { setToken } from './services/gameService';
import Notification from './components/Notification'
import GameForm from './components/GameForm';
import Bets from './components/Bets';
import Login from './components/Login';
import Games from './components/Games';
import Users from './components/Users';
import CreateAccount from './components/RegisterationForm';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom"

const App = () => {
  const [errormessage, setErrorMessage] = useState('');
  const [notificationmessage, setNotificationMessage] = useState('');
  const [user, setUser] = useState<Credentials|null>();

  const padding = {
    padding: 5
  }

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      setToken(user.token)
    }
  }, [])

  return (
    <Router>
      <div>
        <Notification errormessage={errormessage} notificationmessage={notificationmessage} />

        <Routes>
          <Route path="/bets" element={user ? <Bets />: <Navigate replace to="/login" />} />
          <Route path="/players" element={user ? <Users /> : <Navigate replace to="/login" />} />
          <Route path="/addGame" element={user ? <GameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/" element={user ? <Games /> : <Navigate replace to="/login" />} />
          <Route path="/register" element={!user ? <CreateAccount setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/login" element={!user ? <Login setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} setUser={setUser}/>: <Navigate replace to="/" />} />
        </Routes>

        <div>
        
          {user && (
            <>
              <Link style={padding} to="/addGame">Add game</Link>
              <Link style={padding} to="/bets">Bets</Link>
              <Link style={padding} to="/players">Players</Link>
              <Link style={padding} to="/">Home</Link>
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
    console.log('logging out')
    setUser(null)

    window.localStorage.clear()
    setNotificationMessage('You are logged out')
    setTimeout(() => {
      setNotificationMessage('')
    }, 3000)
    navigate('/login');
  }

  return <button onClick={handleLogout}>Logout</button>;
}

export default App;

