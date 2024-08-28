import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Bet } from "../types";
import React from 'react';
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
  const [showAllGames, setShowAllGames] = useState(true);


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


  const handleRemoveBet = async (id: string) => {
    try {
      await removeBet(id);
      setBets(bets.filter(bet => bet.id !== id));
      setNotificationMessage('Bet deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
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

  const handleShowAllClick = () => {
    setShowAllGames(true);
  };

  const handleShowFutureClick = () => {
    setShowAllGames(false);
  };


  const sortedBets = [...bets].sort((a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const futureGames = sortedBets.filter((bet) => new Date(bet.game.date) > new Date());


  const betsToShow = showAllGames ? sortedBets : futureGames;

  return (
    <div>
      <h3>User: {user.username}</h3>
      <button onClick={handleShowAllClick}>Show all games</button>
      <button onClick={handleShowFutureClick}>Show only future games</button>
      {bets && bets?.length > 0 && (
        <>
          <ul>
            {betsToShow.map(bet =>
              <li key={bet.id}>
                <strong>Game: </strong><br />
                <br />
                <div>
                  {formatDate(new Date(bet.game.date))} <br />
                  <br />
                  {bet.game.home_team}-{bet.game.visitor_team} <br />
                  <br />
                </div>
                <strong>Bet: </strong><br />
                {bet.goals_home}-{bet.goals_visitor} <br />
                <br />
                {(user.id === loggedUser.id && new Date(bet.game.date) > new Date() || loggedUser.admin && new Date(bet.game.date) > new Date()) &&(
                  <>
                    <button onClick={() => handleRemoveBet(bet.id)}>Delete bet</button>
                    <button onClick={() => setEditingBet(bet)}>Edit bet</button>
                  </>
                )}
              </li>
            )}
          </ul>
        </>
      )}
      {!bets || bets?.length === 0 && (
        <>
          <br />
          <p> There are no bets for this user </p>
        </>
      )}

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