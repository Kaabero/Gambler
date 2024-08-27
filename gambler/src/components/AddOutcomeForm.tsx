import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Outcome, Game, NewOutcome, Bet, NewScores, User } from "../types";
import React from 'react';
import { getAllOutcomes, addOutcome } from '../services/outcomeService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import { getAllBets } from '../services/betService';
import { addScores } from '../services/scoreService';
import { getOutcomeById } from '../services/outcomeService';



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

  const handleAddScores = async (outcomeId: string, event: React.SyntheticEvent) => {
    event.preventDefault();
    const outcome = await getOutcomeById(outcomeId);
    console.log('outcome', outcome);

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
      handleAddScores(savedOutcome.id, event);
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
          />
        </div>
        <br />
        <button type="submit">Add outcome</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default AddOutcomeForm;
