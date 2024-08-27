import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Outcome } from "../types";
import { Bet, User } from "../types";
import { getAllBets } from '../services/betService';
import { addScores } from '../services/scoreService';
import { NewScores } from '../types';
import { AxiosError } from 'axios';
import React from 'react';
import { getOutcomeById } from '../services/outcomeService';
import { useNavigate } from 'react-router-dom';

interface AddScoresFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}


const AddScoresForm: React.FC<AddScoresFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { outcomeId } = useParams();
  const [outcome, setOutcome] = useState<Outcome>({ id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } });
  const navigate = useNavigate();
  const [bets, setBets] = useState<Bet[]>([
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }, user: {
      id: '1', username: 'TestUser', password: 'Password', admin: false } }
  ]);

  useEffect(() => {
    getAllBets().then((data: React.SetStateAction<Bet[]>) => {
      setBets(data);
    });
  }, []);


  useEffect(() => {
    if (outcomeId) {
      getOutcomeById(outcomeId).then(setOutcome);
    }
  }, [outcomeId]);

  const handleCancel = () => {
    navigate('/');
    setErrorMessage('');
    setNotificationMessage('');
  };

  const addThreePoints = async (users: User[], event: React.SyntheticEvent) => {
    event.preventDefault();
    try {
      for (const user of users) {
        const newScores: NewScores = {
          points: '3',
          outcome: outcome.id,
          user: user.id,
          id: '0'
        };

        await addScores(newScores);
      }

      setNotificationMessage('Scores added successfully!');
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

  const addOnePoint = async (users: User[], event: React.SyntheticEvent) => {
    event.preventDefault();
    try {
      for (const user of users) {
        const newScores: NewScores = {
          points: '1',
          outcome: outcome.id,
          user: user.id,
          id: '0'
        };

        await addScores(newScores);
      }

      setNotificationMessage('Scores added successfully!');
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


  const handleAddScores = async (event: React.SyntheticEvent) => {
    console.log('bets', bets);
    console.log('tulos', outcome.goals_home, outcome.goals_visitor );
    const usersWithRightBets = bets
      .filter(bet => bet.game.id === outcome.game.id && bet.goals_home === outcome.goals_home && bet.goals_visitor === outcome.goals_visitor)
      .map(bet => bet.user);

    console.log('right',usersWithRightBets);
    if (usersWithRightBets.length > 0) {
      await addThreePoints(usersWithRightBets, event);
    }

    if (outcome.goals_home > outcome.goals_visitor) {
      const usersWithHomeTeamWins = bets
        .filter(bet => bet.game.id === outcome.game.id && bet.goals_home > bet.goals_visitor)
        .map(bet => bet.user);

      const filteredUsersWithHomeWins = usersWithHomeTeamWins.filter(user2 =>
        !usersWithRightBets.some(user1 => user1.id === user2.id)
      );


      console.log('one point home', filteredUsersWithHomeWins);

      if (filteredUsersWithHomeWins.length > 0) {
        await addOnePoint(filteredUsersWithHomeWins, event);
      }
    }

    if (outcome.goals_home < outcome.goals_visitor) {
      const usersWithVisitorTeamWins = bets
        .filter(bet => bet.game.id === outcome.game.id && bet.goals_home < bet.goals_visitor)
        .map(bet => bet.user);

      const filteredUsersWithVisitorWins = usersWithVisitorTeamWins.filter(user2 =>
        !usersWithRightBets.some(user1 => user1.id === user2.id)
      );



      console.log('one point visitor', filteredUsersWithVisitorWins);
      if (filteredUsersWithVisitorWins.length > 0) {
        await addOnePoint(filteredUsersWithVisitorWins, event);
      }

    }

    if (outcome.goals_home === outcome.goals_visitor) {
      const usersWithDraw = bets
        .filter(bet => bet.game.id === outcome.game.id && bet.goals_home === bet.goals_visitor)
        .map(bet => bet.user);

      const filteredUsersWithDraw = usersWithDraw.filter(user2 =>
        !usersWithRightBets.some(user1 => user1.id === user2.id)
      );

      console.log('one point draw', filteredUsersWithDraw);
      if (filteredUsersWithDraw.length > 0) {
        await addOnePoint(filteredUsersWithDraw, event);
      }

    }

  };

  return (
    <div>
      <h2>Add scores to players</h2>
      <h3>Game:</h3>
      <p>{outcome.game.home_team}-{outcome.game.visitor_team}</p>
      <h3>Outcome:</h3>
      <p>{outcome.goals_home}-{outcome.goals_visitor}</p>
      <button type="button" onClick={handleAddScores}>Add scores</button>
      <button type="button" onClick={handleCancel}>Cancel</button>

    </div>
  );
};

export default AddScoresForm;