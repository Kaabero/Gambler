import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Bet, Tournament } from '../types';
import React from 'react';
import { getUserById } from '../services/userService';
import { formatDate } from '../utils/dateUtils';
import { removeBet, getAllBets } from '../services/betService';
import { getTournamentById } from '../services/tournamentService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';



interface UsersBetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User,
  selectedTournament: string;
}

const UsersBets: React.FC<UsersBetsProps> = ( { selectedTournament, loggedUser, setErrorMessage, setNotificationMessage }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  );
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
  );
  const [bets, setBets] = useState<Bet[]>([]);
  const [showAllGames, setShowAllGames] = useState(true);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setTournament(data);
      });
    }
  }, [selectedTournament]);


  useEffect(() => {
    if (userId) {
      getUserById(userId).then(setUser);
    }
  }, [userId]);

  useEffect(() => {
    getAllBets().then((data) => {
      setBets(data);
    });
  }, []);

  const filteredBets = bets.filter(
    (bet) => bet.user && bet.user.id === user.id
  );

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

  const handleEditBetClick = (bet: Bet) => {
    navigate(`/editBet/${bet.id}`);
  };


  const handleShowAllClick = () => {
    setShowAllGames(true);
  };

  const handleShowFutureClick = () => {
    setShowAllGames(false);
  };


  const sortedBets = [...filteredBets].sort((a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const futureGames = sortedBets.filter((bet) => new Date(bet.game.date) > new Date());


  const betsToShow = showAllGames ? sortedBets : futureGames;

  const tournamentBets = betsToShow.filter(bet => bet.game.tournament?.id === tournament.id);


  return (
    <div>
      <h3>User: {user.username}</h3>
      <button onClick={handleShowAllClick}>Show all games</button>
      <button onClick={handleShowFutureClick}>Show only future games</button>
      {tournamentBets.length > 0 ? (
        <ul>
          {tournamentBets.map(bet => (
            <li key={bet.id}>
              <hr />
              <strong>Tournament:</strong>
              <div>{bet.game.tournament?.name}</div>
              <strong>Game:</strong>
              <div>
                {formatDate(new Date(bet.game.date))}
                <br />
                {bet.game.home_team} - {bet.game.visitor_team}
              </div>
              <strong>Bet:</strong>
              <div>{bet.goals_home} - {bet.goals_visitor}</div>
              {(user.id === loggedUser.id || loggedUser.admin) && new Date(bet.game.date) > new Date() && (
                <>
                  <button onClick={() => handleRemoveBet(bet.id)}>Delete bet</button>
                  <button onClick={() => handleEditBetClick(bet)}>Edit bet</button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>There are no bets in the selected tournament for this user</p>
      )}
    </div>
  );
};
export default UsersBets;