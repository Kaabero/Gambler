import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';


import { Credentials, Tournament } from '../types';

import AddBetForm from './AddBetForm';
import AddGameForm from './AddGameForm';
import AddOutcomeForm from './AddOutcomeForm';
import AddTournamentForm from './AddTournamentForm';
import AdminTools from './AdminTools';
import Bets from './Bets';
import EditBetForm from './EditBetForm';
import EditGameForm from './EditGameForm';
import EditScoresForm from './EditScoresForm';
import EditTournamentForm from './EditTournamentForm';
import GameResult from './GameResult';
import GameResults from './GameResults';
import Games from './Games';
import GamesBets from './GamesBets';
import GamesPoints from './GamesPoints';
import Login from './Login';
import Points from './Points';
import CreateAccount from './RegisterationForm';
import Tournaments from './Tournaments';
import Users from './Users';
import UsersBets from './UsersBets';
import UsersPoints from './UsersPoints';
import Home from './WelcomePage';





interface RouterComponentProps {
  errormessage: string;
  notificationmessage: string;
  user: Credentials | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
  tournaments: Tournament[];
  selectedTournament: string;
  setSelectedTournament: React.Dispatch<React.SetStateAction<string>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
}

const RouterComponent: React.FC<RouterComponentProps> = ({
  user,
  setUser,
  selectedTournament,
  setSelectedTournament,
  setErrorMessage,
  setNotificationMessage,
  setTournaments
}) => {

  return (
    <div>
      <Routes>
        <Route path="/" element={user ?
          <Home />
          : <Navigate replace to="/login" />}
        />
        <Route path="/addBet/:gameId" element={user ?
          <AddBetForm
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/addGame" element={(user && user.admin) ?
          <AddGameForm
            selectedTournament={selectedTournament}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/addResult/:gameId" element={(user && user.admin) ?
          <AddOutcomeForm
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/addTournament" element={(user && user.admin) ?
          <AddTournamentForm
            setTournaments={setTournaments}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/adminTools" element={(user && user.admin) ?
          <AdminTools
            loggedUser={user}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/bets" element={user ?
          <Bets
            loggedUser={user}
            selectedTournament={selectedTournament}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/bets/:userId" element={user ?
          <UsersBets
            selectedTournament={selectedTournament}
            loggedUser={user}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/editBet/:betId" element={user ?
          <EditBetForm
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/editGame/:gameId" element={(user && user.admin) ?
          <EditGameForm
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route
          path="/editTournament/:tournamentId"
          element={(user && user.admin) ?
            <EditTournamentForm
              setTournaments={setTournaments}
              setErrorMessage={setErrorMessage}
              setNotificationMessage={setNotificationMessage}
            />
            : <Navigate replace to="/" />}
        />
        <Route path="/editScores/:scoresId" element={(user && user.admin) ?
          <EditScoresForm
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/games" element={user ?
          <Games
            selectedTournament={selectedTournament}
            loggedUser={user}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/gamesbets/:gameId" element={user ?
          <GamesBets/>
          : <Navigate replace to="/login" />}
        />
        <Route path="/gamespoints/:outcomeId" element={user ?
          <GamesPoints/>
          : <Navigate replace to="/login" />}
        />
        <Route path="/login" element={!user ?
          <Login
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
            setUser={setUser}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/points" element={user ?
          <Points
            loggedUser={user}
            selectedTournament={selectedTournament}
          /> : <Navigate replace to="/login" />}
        />
        <Route path="/points/:userId" element={user ?
          <UsersPoints
            selectedTournament={selectedTournament}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/register" element={!user ?
          <CreateAccount
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/result/:gameId" element={user ?
          <GameResult />
          : <Navigate replace to="/login" />}
        />
        <Route path="/results" element={user ?
          <GameResults
            loggedUser={user}
            selectedTournament={selectedTournament}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
        <Route path="/tournaments" element={(user && user.admin) ?
          <Tournaments
            loggedUser={user}
            setSelectedTournament={setSelectedTournament}
            setMainTournaments={setTournaments}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/" />}
        />
        <Route path="/users" element={user ?
          <Users
            loggedUser={user}
            selectedTournament={selectedTournament}
            setErrorMessage={setErrorMessage}
            setNotificationMessage={setNotificationMessage}
          />
          : <Navigate replace to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default RouterComponent;
