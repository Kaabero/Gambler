import { addScores } from '../services/scoreService';
import { getOutcomeById } from '../services/outcomeService';
import { NewScores, User, Bet } from "../types";
import { AxiosError } from 'axios';

interface HandleAddScoresProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    outcomeId: string;
    bets: Bet[];
    event: React.SyntheticEvent;
}

export const handleAddScores = async ({ outcomeId, bets, setErrorMessage, event }: HandleAddScoresProps): Promise<void> => {
  event.preventDefault();

  const outcome = await getOutcomeById(outcomeId);

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

    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const usersWithRightBets = bets
    .filter(bet => bet.game.id === outcome.game.id && bet.goals_home === outcome.goals_home && bet.goals_visitor === outcome.goals_visitor)
    .map(bet => bet.user);

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

    if (filteredUsersWithDraw.length > 0) {
      await addOnePoint(filteredUsersWithDraw, event);
    }

  }

};
