import { useState, useEffect } from 'react';
import { Bet, User, Game, Tournament } from '../types';
import { removeBet } from '../services/betService';
import { getAllGames } from '../services/gameService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getTournamentById } from '../services/tournamentService';

interface BetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User,
  selectedTournament: string
}

const Bets: React.FC<BetsProps> = ({ selectedTournament, user, setErrorMessage, setNotificationMessage }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [showAllGames, setShowAllGames] = useState(true);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then(setTournament);
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllGames().then((data) => {
      setGames(data);
    });
  }, []);

  const filteredGames = games.filter(
    (game) => game.tournament && game.tournament.id === tournament.id
  );

  const gamesWithBets = filteredGames.filter((game) => !game.bets || game.bets.length > 0);

  const sortedGames = [...gamesWithBets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const futureGames = sortedGames.filter((game) => new Date(game.date) > new Date());

  const gamesToShow = showAllGames ? sortedGames : futureGames;

  const handleRemoveBetClick = async (id: string) => {
    try {
      await removeBet(id);
      setGames((initialGames) =>
        initialGames.map((game) => ({
          ...game,
          bets: game.bets?.filter((bet) => bet.id !== id),
        }))
      );
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

  const handleShowAllClick = () => {
    setShowAllGames(true);
  };

  const handleShowFutureClick = () => {
    setShowAllGames(false);
  };

  const handleEditBetClick = (bet: Bet) => {
    navigate(`/editBet/${bet.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <div>
      <hr />
      <h2>Bets</h2>
      {gamesWithBets.length > 0 && (
        <>
          <button onClick={handleShowAllClick}>Show all games</button>
          <button onClick={handleShowFutureClick}>Show only future games</button>


          <ul>
            {gamesToShow.map((game) => (
              <li key={game.id}>
                <hr />
                <strong>Game: </strong>
                <br />
                <br />
                <div>
                  {formatDate(new Date(game.date))}
                  <br />
                  {game.home_team} - {game.visitor_team}
                  <br />
                </div>
                <br />

                {game.bets?.map((bet) => (
                  <div key={bet.id}>
                    <strong>Bet:</strong> <br />
                    {bet.goals_home} - {bet.goals_visitor}
                    <br />
                    <br />
                  User: {bet.user.username}
                    <br />
                    <br />
                    {user.admin && new Date(game.date) > new Date() && (
                      <>
                        <button onClick={() => handleRemoveBetClick(bet.id)}> Delete bet </button>
                        <button onClick={() => handleEditBetClick(bet)}>Edit bet</button><br />
                        <br />
                      </>
                    )}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
      {gamesWithBets.length === 0 && (
        <>
          <p> There are no bets added to selected tournament </p>
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default Bets;