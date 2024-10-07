import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { addBet } from '../services/betService';
import { getGameById } from '../services/gameService';
import { NewBet, Game } from '../types';
import { formatDate } from '../utils/dateUtils';

interface AddBetFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddBetForm: React.FC<AddBetFormProps> = ({
  setErrorMessage,
  setNotificationMessage
}) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game>(
    {
      id: '1',
      date: new Date() ,
      home_team: 'HomeTeam',
      visitor_team: 'VisitorTeam' }
  );
  const [visitorGoals, setVisitorGoals] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(setGame);
    }
  }, [gameId]);


  const betCreation = async (event: React.SyntheticEvent) => {

    event.preventDefault();

    if (game && gameId) {
      try {
        const newBet: NewBet = {
          goals_home: homeGoals,
          goals_visitor: visitorGoals,
          game: gameId,
        };

        await addBet(newBet);

        setNotificationMessage('Bet added successfully!');
        setTimeout(() => {
          setNotificationMessage('');
        }, 3000);
        navigate('/games');
      } catch (error) {
        if (error instanceof AxiosError) {
          setErrorMessage(`${error.response?.data.error}`);
          setTimeout(() => {
            setErrorMessage('');
          }, 3000);
        }
      }
    }
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <div>
      <h2>Add a new bet </h2>
      <hr />
      { game && (
        <div>
          <strong> Game: </strong> <br />
          <p> Tournament: {game.tournament?.name}</p>
          {game.home_team}-{game.visitor_team}<br />
          {formatDate(new Date(game.date))} <br />
          <hr />
          <form onSubmit={betCreation}>
            <div>
          Goals for {game.home_team}:
              <br />
              <input
                data-testid='home_goals'
                type="number"
                value={homeGoals}
                onChange={({ target }) => setHomeGoals(target.value)}
                min="0"
              />
            </div>
            <br />
            <div>
          Goals for {game.visitor_team}:
              <br />
              <input
                data-testid='visitor_goals'
                type="number"
                value={visitorGoals}
                onChange={({ target }) => setVisitorGoals(target.value)}
                min="0"
              />
            </div>
            <br />
            <button type="submit">Add bet</button>
            <button type="button" onClick={handleGoBackClick}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {!game && (
        <>
          <br />
          <p> No game selected for betting. </p>
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
    </div>
  );
};

export default AddBetForm;
