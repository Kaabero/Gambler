import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { removeBet, getAllBets } from '../services/betService';
import { getTournamentById } from '../services/tournamentService';
import { getUserById } from '../services/userService';
import { User, Bet, Tournament } from '../types';
import { formatDate } from '../utils/dateUtils';




interface UsersBetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User,
  selectedTournament: string;
}

const UsersBets: React.FC<UsersBetsProps> = ( {
  selectedTournament,
  loggedUser,
  setErrorMessage,
  setNotificationMessage
}) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  );
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1',
      name: 'TestTournament',
      from_date: new Date(),
      to_date: new Date() }
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

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAllGames(value === 'all');
  };


  const sortedBets = [...filteredBets]
    .sort((a, b) =>
      new Date(a.game.date).getTime() - new Date(b.game.date).getTime());

  const futureGames = sortedBets
    .filter((bet) =>
      new Date(bet.game.date) > new Date());


  const betsToShow = showAllGames ? sortedBets : futureGames;

  const tournamentBets = betsToShow
    .filter(bet => bet.game.tournament?.id === tournament.id);


  return (
    <div>
      <hr />

      {sortedBets.length > 0 && (
        <>
          <div>

            <label>
              <input
                type="radio"
                value="future"
                checked={!showAllGames}
                onChange={handleRadioChange}
              />
                Show only future games
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="all"
                checked={showAllGames}
                onChange={handleRadioChange}
              />
                Show all games
            </label>
          </div>
        </>
      )}
      {tournamentBets.length > 0 && (
        <>
          <h2>{user.username}'s bets in tournament {tournament.name}</h2>
          <ul>
            {tournamentBets.map(bet => (
              <li key={bet.id}>
                <hr />
                <strong>Game:</strong><br />
                <br />
                {formatDate(new Date(bet.game.date))}
                <br />
                {bet.game.home_team} - {bet.game.visitor_team}<br />
                <br />
                <strong>Bet:</strong>
                <div>{bet.goals_home} - {bet.goals_visitor}</div> <br />
                {(user.id === loggedUser.id) &&
                new Date(bet.game.date) > new Date() && (
                  <>
                    <button onClick={() =>
                      handleRemoveBet(bet.id)}>
                        Delete bet
                    </button>
                    <button onClick={() =>
                      handleEditBetClick(bet)}>
                        Edit bet
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {tournamentBets.length === 0 && (
        <>
          <h2>User's bets </h2>
          <p>There are no bets in the selected tournament for this user</p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};
export default UsersBets;