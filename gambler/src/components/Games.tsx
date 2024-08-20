import { useState, useEffect } from 'react';
import { Game, User } from "../types";
import { getAllGames, removeGame, editGame } from '../services/gameService';
import React from 'react';
import EditGameForm from './EditGameForm';

interface GamesProps {
  user: User;
}

const Games: React.FC<GamesProps> = ({ user }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);


  useEffect(() => {
    getAllGames().then((data) => {
      setGames(data);
    });
  }, []);

  const handleRemoveGame = (id: string) => {
    removeGame(id).then(() => {
      setGames(games.filter(game => game.id !== id));
    });
  };

    const handleUpdateGame = async (updatedGame: Game) => {
    const editedGame = await editGame(updatedGame.id, updatedGame);
    setGames(games.map(game => game.id === updatedGame.id ? editedGame : game));
    setEditingGame(null); 
  };

  return (
    <div>
      <h2>Games</h2>
      <ul>
        {games.map(game =>
          <li key={game.id}>
            <strong>{game.date}</strong><br />
            Home Team: {game.home_team} <br />
            Visitor Team: {game.visitor_team} <br />
            {user.admin && (
              <>
                <button onClick={() => handleRemoveGame(game.id)}>Delete</button>
                <button onClick={() => setEditingGame(game)}>Edit</button>
              </>
            )}
            <br />
          </li>
        )}
      </ul>

      {editingGame && (
        <EditGameForm game={editingGame} onSave={handleUpdateGame} onCancel={() => setEditingGame(null)} />
      )}
    </div>
  );
};

export default Games;

