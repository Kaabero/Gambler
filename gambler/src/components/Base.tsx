import React from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';

import { Credentials, Tournament } from '../types';

import Logout from './Logout';
import RouterComponent from './RouterComponent';
import TournamentSelection from './TournamentSelection';



interface BaseProps {
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

const Base: React.FC<BaseProps> = ({
  user,
  setUser,
  selectedTournament,
  setSelectedTournament,
  setErrorMessage,
  setNotificationMessage,
  setTournaments,
  errormessage,
  notificationmessage,
  tournaments
}) => {

  const navigate = useNavigate();


  const padding = {
    padding: 5,
  };

  const handleAdminToolsClick = () => {
    navigate('/admintools');
  };

  return (
    <div className="container">
      <TournamentSelection
        user={user}
        tournaments={tournaments}
        selectedTournament={selectedTournament}
        setSelectedTournament={setSelectedTournament}
      />
      <RouterComponent
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
      <div>
        {user ? (
          <>
            <hr />
            <Link style={padding} to="/">Home</Link>
            <Link style={padding} to="/games">Games</Link>
            <Link style={padding} to="/bets">All bets</Link>
            <Link style={padding} to={`/bets/${user.id}`}>
            View and manage your bets</Link>
            <Link style={padding} to={`/points/${user.id}`}>
            View your points</Link>
            <Link style={padding} to="/results">Game results</Link>
            <Link style={padding} to="/users">Users and their points</Link>
            <Link style={padding} to="/points">Received points</Link>
            <br />
            <hr />
            <p>
              {user.username} logged in
              <br />
              <br />
              <Logout
                setSelectedTournament={setSelectedTournament}
                setUser={setUser}
                setNotificationMessage={setNotificationMessage}
              />
              {user.admin && <button onClick={handleAdminToolsClick}>
              Admin tools</button>}

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

export default Base;
