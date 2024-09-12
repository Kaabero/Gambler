import { useState, useEffect } from 'react';
import { Game, User, Tournament } from '../types';
import { useNavigate } from 'react-router-dom';
import { getAllGames, removeGame } from '../services/gameService';
import { getTournamentById } from '../services/tournamentService';
import React from 'react';
import { AxiosError } from 'axios';
import { formatDate } from '../utils/dateUtils';

interface GamesProps {
  user: User;
  selectedTournament: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Games: React.FC<GamesProps> = ({ selectedTournament, user, setErrorMessage, setNotificationMessage }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [showAllGames, setShowAllGames] = useState(true);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1', name: 'TestTournament' }
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setTournament(data);
      });
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllGames().then((data) => {
      setGames(data);
    });
  }, []);


  const handleRemoveGame = (id: string) => {
    try {

      if (confirm('Deleting game will also remove related bets, game results and scores!')) {
        removeGame(id).then(() => {
          setGames(games.filter(game => game.id !== id));
          setNotificationMessage('Game deleted successfully!');
          setTimeout(() => {
            setNotificationMessage('');
          }, 3000);
        });
      } else {
        return;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };


  const handleAddBetClick = (game: Game) => {

    navigate(`/addBet/${game.id}`);
  };

  const handleAddResultClick = (game: Game) => {

    navigate(`/addResult/${game.id}`);
  };

  const handleCheckResultClick = (game: Game) => {

    navigate(`/result/${game.id}`);
  };

  const handleCheckBetsClick = (game: Game) => {

    navigate(`/gamesbets/${game.id}`);
  };

  const userHasBet = (game: Game) => {
    return game.bets?.some(bet => bet.user && bet.user.username === user.username);
  };

  const handleShowAllClick = () => {
    setShowAllGames(true);
  };

  const handleShowFutureClick = () => {
    setShowAllGames(false);
  };

  const handleEditGameClick = (game: Game) => {
    navigate(`/editGame/${game.id}`);
  };



  const filteredGames = games.filter(
    (game) => game.tournament && game.tournament.id === tournament.id
  );

  const sortedGames = [...filteredGames].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const futureGames = sortedGames.filter((game) => new Date(game.date) > new Date());

  const gamesToShow = showAllGames ? sortedGames : futureGames;

  return (
    <div>
      { selectedTournament && (

        <div>
          <h2>Games</h2>
          <button onClick={handleShowAllClick}>Show all games</button>
          <button onClick={handleShowFutureClick}>Show only future games</button>
          {games.length > 0 && (
            <>
              <ul>
                {gamesToShow.map(game =>
                  <li key={game.id}>
                    <strong>{formatDate(new Date(game.date))}</strong><br />
                  Home Team: {game.home_team} <br />
                  Visitor Team: {game.visitor_team} <br />
                    <br />
                    <button onClick={() => handleCheckBetsClick(game)}>Check bets</button>
                    {user && !game.outcome && !userHasBet(game) && (
                      <>
                        <button onClick={() => handleAddBetClick(game)}>Add bet</button>
                      </>
                    )}
                    {user.admin &&(
                      <>
                        <button onClick={() => handleRemoveGame(game.id)}>Delete game</button>
                        <button onClick={() => handleEditGameClick(game)}>Edit game</button>
                      </>
                    )}
                    {user.admin && !game.outcome && new Date(game.date) < new Date() &&(
                      <>
                        <button onClick={() => handleAddResultClick(game)}>Add result and points</button>
                      </>
                    )}
                    {user && game.outcome && (
                      <>
                        <button onClick={() => handleCheckResultClick(game)}>Check result</button> <br />
                      </>
                    )}
                    <br />
                  </li>
                )}
              </ul>
            </>
          )}
          {games.length === 0 && (
            <>
              <br />
              <p> There are no games added to selected tournament</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Games;
