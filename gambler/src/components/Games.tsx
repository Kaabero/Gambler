import { useState, useEffect } from 'react';
import { Game, User } from "../types";
import { useNavigate } from 'react-router-dom';
import { getAllGames, removeGame, editGame } from '../services/gameService';
import React from 'react';
import EditGameForm from './EditGameForm';
import { formatDate } from '../utils/dateUtils';

interface GamesProps {
  user: User;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Games: React.FC<GamesProps> = ({ user, setErrorMessage, setNotificationMessage }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllGames().then((data) => {
      setGames(data);
    });
  }, []);

  const handleRemoveGame = (id: string) => {
    removeGame(id).then(() => {
      setGames(games.filter(game => game.id !== id));
      setNotificationMessage('Game deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
    });
  };

  const handleUpdateGame = async (updatedGame: Game) => {
    const editedGame = await editGame(updatedGame.id, updatedGame);
    setGames(games.map(game => game.id === updatedGame.id ? editedGame : game));
    setEditingGame(null);
  };


  const handleAddBetClick = (game: Game) => {

    navigate(`/addBet/${game.id}`);
  };

  const handleAddResultClick = (game: Game) => {

    navigate(`/addOutcome/${game.id}`);
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


  const sortedGames = [...games].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <h2>Games</h2>
      <ul>
        {sortedGames.map(game =>
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
                <button onClick={() => handleRemoveGame(game.id)}>Delete</button>
                <button onClick={() => setEditingGame(game)}>Edit</button>
              </>
            )}
            {user.admin && !game.outcome && new Date(game.date) < new Date() &&(
              <>

                <button onClick={() => handleAddResultClick(game)}>Add result and scores</button>
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

      {editingGame && (
        <EditGameForm
          game={editingGame}
          setErrorMessage={setErrorMessage}
          setNotificationMessage={setNotificationMessage}
          onSave={handleUpdateGame}
          onCancel={() => setEditingGame(null)}
        />
      )}

    </div>
  );
};

export default Games;
