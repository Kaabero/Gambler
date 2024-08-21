import { useState, useEffect } from 'react';
import { Game, User } from "../types";
import { getAllGames, removeGame, editGame } from '../services/gameService';
import React from 'react';
import EditGameForm from './EditGameForm';
import AddOutcomeForm from './AddOutcomeForm';
import AddBetForm from './AddBetForm';
import { formatDate } from '../utils/dateUtils';

interface GamesProps {
  user: User;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Games: React.FC<GamesProps> = ({ user, setErrorMessage, setNotificationMessage }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [playedGame, setPlayedGame] = useState<Game | null>(null);
  const [gameForBet, setGameForBet] = useState<Game | null>(null);

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
            {user && game.outcome && (
            <>
            <br />
            Outcome:<br />
            {game.outcome.goals_home} - {game.outcome.goals_visitor} <br />
            </>
            )}
            {user && !game.outcome &&(
              <>
            <button onClick={() => setGameForBet(game)}>Add bet</button>
            </>
            )}
            {user.admin && !game.outcome &&(
              <>
                <button onClick={() => handleRemoveGame(game.id)}>Delete</button>
                <button onClick={() => setEditingGame(game)}>Edit</button>
                <button onClick={() => setPlayedGame(game)}>Add outcome</button>
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
      {playedGame && (
        <AddOutcomeForm
          game={playedGame}
          setErrorMessage={setErrorMessage}
          setNotificationMessage={setNotificationMessage}
          setPlayedGame={setPlayedGame}
        />
      )}
      {gameForBet && (
        <AddBetForm
          game={gameForBet}
          setErrorMessage={setErrorMessage}
          setNotificationMessage={setNotificationMessage}
          setGameForBet={setGameForBet}
          user={user}
        />
      )}
    </div>
  );
};

export default Games;
