import { useState } from 'react';
import { Game } from '../types';
import React from 'react';
import { formatDateForInput } from '../utils/dateUtils';

interface EditGameFormProps {
  game: Game;
  onSave: (updatedGame: Game) => void;
  onCancel: () => void;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditGameForm: React.FC<EditGameFormProps> = ({ game, onSave, onCancel, setErrorMessage, setNotificationMessage }) => {
  const [date, setDate] = useState(formatDateForInput(new Date(game.date)));
  const [visitorTeam, setVisitorTeam] = useState(game.visitor_team);
  const [homeTeam, setHomeTeam] = useState(game.home_team);


  const gameEdition = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (homeTeam.trim().toLowerCase() === visitorTeam.trim().toLowerCase()) {
      setErrorMessage('Home team and visitor team cannot be the same.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    const updatedGame: Game = {
      ...game,
      date: new Date(date),
      home_team: homeTeam || game.home_team,
      visitor_team: visitorTeam || game.visitor_team,
    };

    setErrorMessage('');
    onSave(updatedGame);
    setNotificationMessage('Game edited successfully!');
    setTimeout(() => {
      setNotificationMessage('');
    }, 3000);
  };

  return (
    <div>
      <h2>Edit the game</h2>
      <form onSubmit={gameEdition}>
        <div>
          Date:
          <br />
          <input
            type='datetime-local'
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




