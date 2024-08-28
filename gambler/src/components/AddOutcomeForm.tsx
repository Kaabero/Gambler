import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Outcome, Game, NewOutcome, Bet } from "../types";
import React from 'react';
import { getAllOutcomes, addOutcome } from '../services/outcomeService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { getAllBets } from '../services/betService';
import { handleAddScores } from './AddScores';




interface AddOutcomeFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddOutcomeForm: React.FC<AddOutcomeFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { gameId } = useParams();
  const [game, setGame] = useState<Game>(
    { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  );
  const [visitorGoals, setVisitorGoals] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [bets, setBets] = useState<Bet[]>([
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }, user: {
      id: '1', username: 'TestUser', password: 'Password', admin: false } }
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

  const handleCancel = () => {
    navigate('/');
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

      setNotificationMessage('Outcome and scores added successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/');


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
      <h2>Add a new outcome</h2>
      <form onSubmit={outcomeCreation}>
        <div>
        Goals for {game.home_team}:
          <br />
          <input
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
            type="number"
            value={visitorGoals}
            onChange={({ target }) => setVisitorGoals(target.value)}
            min="0"
          />
        </div>
        <br />
        <button type="submit">Add outcome and scores</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default AddOutcomeForm;
