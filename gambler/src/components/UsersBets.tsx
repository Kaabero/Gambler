import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Bet } from "../types";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../services/userService';
import { formatDate } from '../utils/dateUtils';
import { removeBet, editBet } from '../services/betService';
import { AxiosError } from 'axios';
import EditBetForm from './EditBetForm';



interface UsersBetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User
}

const UsersBets: React.FC<UsersBetsProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
  const { userId } = useParams();
  const [user, setUser] = useState<User>(
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  );
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      getUserById(userId).then(setUser);
    }
  }, [userId]);

  useEffect(() => {
    if (user && user.bets) {
      setBets(user.bets);
    }
  }, [user]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRemoveBet = async (id: string) => {
    try {
      await removeBet(id);
      setBets(bets.filter(bet => bet.id !== id));
      setNotificationMessage('Bet deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/');
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleUpdateBet = async (updatedBet: Bet) => {
    const editedBet = await editBet(updatedBet.id, updatedBet);
    setBets(bets.map(bet => bet.id === updatedBet.id ? editedBet : bet));
    setEditingBet(null);
  };

  return (
    <div>
      <h2>User:</h2>
      <p>{user.username}</p>
      <ul>
        {bets.map(bet =>
          <li key={bet.id}>
            <strong>Game: {bet.game.home_team}-{bet.game.visitor_team} on {formatDate(new Date(bet.game.date))} </strong><br />
            Bet: {bet.goals_home}-{bet.goals_visitor} <br />
            <br />
            {(user.id === loggedUser.id || loggedUser.admin) &&(
              <>
                <button onClick={() => handleRemoveBet(bet.id)}>Delete</button>
                <button onClick={() => setEditingBet(bet)}>Edit</button>
              </>
            )}
          </li>
        )}
      </ul>
      <button type="button" onClick={handleGoHome}>Go home</button>
      <button type="button" onClick={handleGoBack}>Go back</button>

      {editingBet && (
        <EditBetForm
          bet={editingBet}
          setErrorMessage={setErrorMessage}
          setNotificationMessage={setNotificationMessage}
          onSave={handleUpdateBet}
          onCancel={() => setEditingBet(null)}
          setEditingBet={setEditingBet}
        />
      )}
    </div>
  );
};

export default UsersBets;