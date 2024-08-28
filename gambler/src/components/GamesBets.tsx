import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, Bet, User } from "../types";
import React from 'react';
import { getGameById } from '../services/gameService';
import { formatDate } from '../utils/dateUtils';
import { removeBet } from '../services/betService';
import { AxiosError } from 'axios';


interface GamesBetProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User
}

const GamesBets: React.FC<GamesBetProps> = ( { loggedUser, setErrorMessage, setNotificationMessage }) => {
  const { gameId } = useParams();
  const [game, setGame] = useState<Game>(
    { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
  );
  const [bets, setBets] = useState<Bet[]>([]);


  useEffect(() => {
    if (gameId) {
      getGameById(gameId).then(setGame);
    }
  }, [gameId]);

  useEffect(() => {
    if (game && game.bets) {
      setBets(game.bets);
    }
  }, [game]);


  const handleRemoveBet = async (id: string) => {
    try {
      await removeBet(id);
      setBets(bets.filter(bet => bet.id !== id));
      setNotificationMessage('Bet deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
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
      <strong>Game: </strong><br />
      <br />
      <div>
        {formatDate(new Date(game.date))}<br />
        {game.home_team}-{game.visitor_team} <br />
      </div>
      {game.bets && game.bets?.length > 0 && (
        <>
          <ul>
            {bets.map(bet =>
              <li key={bet.id}>
                <strong>User:</strong> {bet.user.username}<br />
                <br />
                <strong>Bet: </strong> {bet.goals_home}-{bet.goals_visitor}<br />
                <br />
                {( loggedUser.admin && new Date(game.date) > new Date()) &&(
                  <>
                    <button onClick={() => handleRemoveBet(bet.id)}>Delete bet</button>
                    <hr />
                  </>
                )}
              </li>
            )}
          </ul>
        </>
      )}
      {!game.bets || game.bets?.length === 0 && (
        <>
          <br />
          <strong> There are no bets for this game </strong>
        </>
      )}
    </div>

  );
};

export default GamesBets;