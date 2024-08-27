import { User } from "../types";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';



interface UsersBetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User;
}

const UsersBets: React.FC<UsersBetsProps> = ({ user }) => {
  const navigate = useNavigate();


  const handleGoHome = () => {
    navigate('/');
  };

  console.log('user', user);
  return (
    <div>
      <h2>User:</h2>
      <p>{user.username}</p>
      <ul>
        {user.bets?.map(bet =>
          <li key={bet.id}>
            <strong>Game: {bet.game.home_team}-{bet.game.visitor_team} on {formatDate(bet.game.date)} </strong><br />
            Bet: {bet.goals_home}-{bet.goals_visitor} <br />
            <br />
          </li>
        )}
      </ul>
      <button type="button" onClick={handleGoHome}>Go back home</button>
    </div>
  );
};

export default UsersBets;