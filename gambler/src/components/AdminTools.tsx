import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';



interface AdminToolsProps {
  loggedUser: User
}

const AdminTools: React.FC<AdminToolsProps> = ({ loggedUser }) => {
  const navigate = useNavigate();
  const padding = {
    padding: 5,
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <div>
      <hr />
      <h2>Admin tools </h2>
      {loggedUser.admin && (
        <>
          <strong>Manage tournaments:</strong><br />
          <Link style={padding} to="/addTournament">Add a new tournament</Link><br />
          <Link style={padding} to="/tournaments">Edit and remove tournaments</Link><br />
          <br />
          <strong>Manage games:</strong><br />
          <Link style={padding} to="/addGame">Add a new game</Link><br />
          <Link style={padding} to="/games">Edit and remove games, add game results</Link><br />
          <br />
          <strong>Manage game results:</strong><br />
          <Link style={padding} to="/results">Delete game results and related scores</Link><br />
          <br />
          <strong>Manage bets:</strong><br />
          <Link style={padding} to="/bets">Edit and remove bets</Link><br />
          <br />
          <strong>Manage points:</strong><br />
          <Link style={padding} to="/points">Edit and remove received points</Link><br />
          <br />
          <strong>Manage users:</strong><br />
          <Link style={padding} to="/users">Remove users, add admin rights</Link><br />

          <br />
        </>
      )}
      {!loggedUser.admin && (
        <>
          <p> You need the admin rights to see the tools. </p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>

  );
};

export default AdminTools;