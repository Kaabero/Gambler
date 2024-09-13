import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Credentials, Tournament } from '../types';
import Bets from './Bets';
import GameResults from './GameResults';
import Login from './Login';
import Games from './Games';
import Users from './Users';
import AddBetForm from './AddBetForm';
import AddOutcomeForm from './AddOutcomeForm';
import CreateAccount from './RegisterationForm';
import GameResult from './GameResult';
import UsersBets from './UsersBets';
import GamesBets from './GamesBets';
import Points from './Points';
import UsersPoints from './UsersPoints';
import GamesPoints from './GamesPoints';
import EditGameForm from './EditGameForm';
import EditBetForm from './EditBetForm';
import EditScoresForm from './EditScoresForm';
import AddGameForm from './AddGameForm';
import Logout from './Logout';


interface MainComponentProps {
  errormessage: string;
  notificationmessage: string;
  user: Credentials | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
  tournaments: Tournament[];
  selectedTournament: string;
  setSelectedTournament: React.Dispatch<React.SetStateAction<string>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const MainComponent: React.FC<MainComponentProps> = ({
  user,
  setUser,
  tournaments,
  selectedTournament,
  setSelectedTournament,
  setErrorMessage,
  setNotificationMessage,
}) => {
  const location = useLocation();


  const padding = {
    padding: 5,
  };

  const hideTournamentSelectionPaths = [
    '/login',
    '/register',
    '/addBet/',
    '/gamesbets/',
    '/gamespoints/',
    '/addBet/',
    '/editGame/',
    '/editScores/',
    '/editBet/',
    '/addResult/',
    '/result/'
  ];

  const shouldShowTournamentSelection =
    user && !hideTournamentSelectionPaths.some((path) => location.pathname.startsWith(path));


  return (
    <div>
      {shouldShowTournamentSelection && (
        <>
          <strong>Tournament:</strong>
          <br />
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
          </select>
        </>
      )}
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
        {user ? (
          <>
            <br />
            <Link style={padding} to="/">
              Home
            </Link>
            {user.admin && <Link style={padding} to="/addGame">Add game</Link>}
            <Link style={padding} to="/bets">All bets</Link>
            <Link style={padding} to={`/bets/${user.id}`}>
              Check and manage your own bets
            </Link>
            <Link style={padding} to={`/points/${user.id}`}>
              Check your points
            </Link>
            <Link style={padding} to="/results">Game results</Link>
            <Link style={padding} to="/users">Users and points</Link>
            <Link style={padding} to="/points">Received points</Link>
            <br />
            <p>
              {user.username} logged in
              <br />
              <br />
              <Logout
                setSelectedTournament={setSelectedTournament}
                setUser={setUser}
                setNotificationMessage={setNotificationMessage}
              />
            </p>
          </>
        ) : (
          <>
            <Link style={padding} to="/login">Login</Link>
            <Link style={padding} to="/register">Create account</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MainComponent;
