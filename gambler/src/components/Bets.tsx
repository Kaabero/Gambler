import { useState, useEffect } from 'react';
import { Bet, User } from "../types";
import { getAllBets, removeBet } from '../services/betService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { AxiosError } from 'axios';

interface BetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  user: User
}

const Bets: React.FC<BetsProps> = ({ user, setErrorMessage, setNotificationMessage }) => {

  const [bets, setBets] = useState<Bet[]>([
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }, user: {
      id: '1', username: 'TestUser', password: 'Password', admin: false } }
  ]);

  useEffect(() => {
    getAllBets().then((data: React.SetStateAction<Bet[]>) => {
      setBets(data);
    });
  }, []);

  const handleRemoveBetClick = async (id: string) => {
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

  const betsByGame: { [gameId: string]: Bet[] } = bets.reduce((acc, bet) => {
    if (!acc[bet.game.id]) {
      acc[bet.game.id] = [];
    }
    acc[bet.game.id].push(bet);
    return acc;
  }, {} as { [gameId: string]: Bet[] });


  const sortedGames = Object.entries(betsByGame).sort(
    ([, betsA], [, betsB]) =>
      new Date(betsA[0].game.date).getTime() - new Date(betsB[0].game.date).getTime()
  );

  return (
    <div>
      <h2>Bets</h2>
      {bets && bets.length > 0 ? (
        <ul>
          {sortedGames.map(([gameId, bets]) => (
            <li key={gameId}>
              <strong>Game: </strong>
              <br />
              <br />
              <div>
                {formatDate(new Date(bets[0].game.date))}
                <br />
                {bets[0].game.home_team} - {bets[0].game.visitor_team}
                <br />
              </div>
              <br />

              {bets.map((bet) => (
                <div key={bet.id}>
                  <strong>Bet:</strong> <br />
                  {bet.goals_home} - {bet.goals_visitor}
                  <br />
                  <br />
                  Player: {bet.user.username}
                  <br />
                  <br />
                  {user.admin && new Date(bet.game.date) > new Date() && (
                    <>
                      <button onClick={() => handleRemoveBetClick(bet.id)}>
                        Delete bet
                      </button>
                    </>
                  )}
                </div>
              ))}
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>There are no bets</p>
      )}
    </div>
  );
};

export default Bets;