import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { getAllBets } from '../services/betService';
import { getGameById } from '../services/gameService';
import { getAllOutcomes, addOutcome } from '../services/outcomeService';
import { Outcome, Game, NewOutcome, Bet } from '../types';
import { formatDate } from '../utils/dateUtils';

import { handleAddScores } from './AddScores';




interface AddOutcomeFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddOutcomeForm: React.FC<AddOutcomeFormProps> = ({
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
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [bets, setBets] = useState<Bet[]>([
    { id: '1',
      goals_home: '1',
      goals_visitor: '1',
      game: {
        id: '1',
        date: new Date() ,
        home_team: 'HomeTeam',
        visitor_team: 'VisitorTeam' },
      user: {
        id: '1',
        username: 'TestUser',
        password: 'Password',
        admin: false } }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllOutcomes().then(data => {
      setOutcomes(data);
    });
  }, []);

  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(setGame);
    }
  }, [gameId]);

  useEffect(() => {
    getAllBets().then((data: React.SetStateAction<Bet[]>) => {
      setBets(data);
    });
  }, []);

  const handleGoBackClick = () => {
    navigate(-1);
  };



  const outcomeCreation = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {

      const newOutcome: NewOutcome = {
        goals_home: homeGoals,
        goals_visitor: visitorGoals,
        game: game.id,
      };
      const savedOutcome = await addOutcome(newOutcome);

      setOutcomes(outcomes.concat(savedOutcome));

      handleAddScores({
        outcomeId: savedOutcome.id,
        bets: bets,
        setErrorMessage: setErrorMessage,
        event: event
      });

      setNotificationMessage('Game result and scores added successfully!');
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
  };

  return (
    <div>
      <h2>Add result:  </h2>
      { game && gameId && (
        <div>
          <strong> Tournament: </strong>
          {game.tournament?.name}<br />
          <br />
          <strong> Game: </strong> <br />
          <br />
          {game.home_team}-{game.visitor_team}<br />
          {formatDate(new Date(game.date))} <br />
          <br />
          <form onSubmit={outcomeCreation}>
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
            <button type="submit">Add result and points</button>
            <button type="button" onClick={handleGoBackClick}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {!gameId && (
        <>
          <br />
          <p> No game selected. </p>
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
    </div>
  );
};
export default AddOutcomeForm;
