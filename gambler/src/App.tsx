import { useState, useEffect } from 'react';
import { Credentials, Tournament } from './types';
import React from 'react';
import { setToken } from './utils/setToken';
import Notification from './components/Notification';
import AddGameForm from './components/AddGameForm';
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
import Points from './components/Points';
import UsersPoints from './components/UsersPoints';
import GamesPoints from './components/GamesPoints';
import EditGameForm from './components/EditGameForm';
import EditBetForm from './components/EditBetForm';
import EditScoresForm from './components/EditScoresForm';
import { getAllTournaments } from './services/tournamentService';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';

const App = () => {
  const [errormessage, setErrorMessage] = useState('');
  const [notificationmessage, setNotificationMessage] = useState('');
  const [user, setUser] = useState<Credentials|null>();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');

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

  useEffect(() => {
    getAllTournaments().then(data => {
      setTournaments(data);
    });
  }, []);

  return (
    <><div>
      <Notification errormessage={errormessage} notificationmessage={notificationmessage} /> <br />
      <br />
      {user &&
      <><strong>Tournament:</strong><br />
        <br />
        <select
          id="tournament-select"
          value={selectedTournament}
          onChange={({ target }) => setSelectedTournament(target.value)}
          required
        >
          <option value="" disabled>
            -- Choose a tournament --
          </option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select></>
      }
    </div>
    <Router>
      <div>
        <Routes>
          <Route path="/bets" element={user ? <Bets user={user} selectedTournament={selectedTournament} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/points" element={user ? <Points loggedUser={user} selectedTournament={selectedTournament} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/results" element={user ? <GameResults user={user} selectedTournament={selectedTournament} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/users" element={user ? <Users loggedUser={user} selectedTournament={selectedTournament} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/addGame" element={(user && user.admin) ? <AddGameForm selectedTournament={selectedTournament} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/" element={user ? <Games selectedTournament={selectedTournament} user={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/bets/:userId" element={user ? <UsersBets selectedTournament={selectedTournament} loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/points/:userId" element={user ? <UsersPoints selectedTournament={selectedTournament} loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/gamesbets/:gameId" element={user ? <GamesBets loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/gamespoints/:outcomeId" element={user ? <GamesPoints loggedUser={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/register" element={!user ? <CreateAccount setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/login" element={!user ? <Login setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} setUser={setUser} /> : <Navigate replace to="/" />} />
          <Route path="/addBet/:gameId" element={user ? <AddBetForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/editGame/:gameId" element={(user && user.admin) ? <EditGameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/editScores/:scoresId" element={(user && user.admin) ? <EditScoresForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/editBet/:betId" element={user ? <EditBetForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
          <Route path="/addResult/:gameId" element={(user && user.admin) ? <AddOutcomeForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/" />} />
          <Route path="/result/:gameId" element={user ? <GameResult user={user} setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} /> : <Navigate replace to="/login" />} />
        </Routes>

        <div>

          {user && (
            <>
              <br />
              <Link style={padding} to="/">Home</Link>
              {user.admin ? <Link style={padding} to="/addGame">Add game</Link> : <></>}
              <Link style={padding} to="/bets">All bets</Link>
              <Link style={padding} to={`/bets/${user.id}`}>Check and manage your own bets</Link>
              <Link style={padding} to={`/points/${user.id}`}>Check your points</Link>
              <Link style={padding} to="/results">Game results</Link>
              <Link style={padding} to="/users">Users and points</Link>
              <Link style={padding} to="/points">Received points</Link>
              <br />
            </>
          )}
          {user ? (
            <p>{user.username} logged in
              <br />
              <br />
              <LogoutButton setSelectedTournament={setSelectedTournament}setUser={setUser} setNotificationMessage={setNotificationMessage} /></p>
          ) : (
            <><Link style={padding} to="/login">Login</Link><Link style={padding} to="/register">Create account</Link></>
          )}

        </div>
      </div>
    </Router></>
  );
};

interface LogoutProps {
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTournament: React.Dispatch<React.SetStateAction<string>>;
}


const LogoutButton: React.FC<LogoutProps> = ({ setSelectedTournament, setNotificationMessage, setUser }) => {
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

export default App;



