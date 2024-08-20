import { useState } from 'react';
import { Game } from "../types";
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface EditGameFormProps {
  game: Game;
  onSave: (updatedGame: Game) => void;
  onCancel: () => void;
}

const EditGameForm: React.FC<EditGameFormProps> = ({ game, onSave, onCancel }) => {
  const [date, setDate] = useState(game.date);
  const [visitorTeam, setVisitorTeam] = useState(game.visitor_team);
  const [homeTeam, setHomeTeam] = useState(game.home_team);
  const navigate = useNavigate();

  const gameEdition = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const updatedGame: Game = {
      ...game,
      date: date || game.date,
      home_team: homeTeam || game.home_team,
      visitor_team: visitorTeam || game.visitor_team,
    };

    onSave(updatedGame);  // Call onSave with the updated game
    navigate('/');  // Optionally navigate away after saving
  };

  return (
    <div>
      <h2>Edit the game</h2>
      <form onSubmit={gameEdition}>
        <div>
          Date:
          <br />
          <input
            type='date'
            value={date}
            onChange={({ target }) => setDate(target.value)}
          />
        </div>
        <br />
        <div>
          Home Team: 
          <br />
          <input
            value={homeTeam}
            onChange={({ target }) => setHomeTeam(target.value)}
          />
        </div>
        <br />
        <div>
          Visitor Team:
          <br />
          <input
            value={visitorTeam}
            onChange={({ target }) => setVisitorTeam(target.value)}
          />
        </div>
        <br />
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default EditGameForm;


