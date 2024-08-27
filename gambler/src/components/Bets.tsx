import { useState, useEffect } from 'react';
import { Bet } from "../types";
import { getAllBets } from '../services/betService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';


const Bets = () => {

  const [bets, setBets] = useState<Bet[]>([
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }, user: {
      id: '1', username: 'TestUser', password: 'Password', admin: false } }
  ]);

  useEffect(() => {
    getAllBets().then((data: React.SetStateAction<Bet[]>) => {
      setBets(data);
    });
  }, []);

  const betsByGame: { [gameId: string]: Bet[] } = bets.reduce((acc, bet) => {
    if (!acc[bet.game.id]) {
      acc[bet.game.id] = [];
    }
    acc[bet.game.id].push(bet);
    return acc;
  }, {} as { [gameId: string]: Bet[] });

  return (
    <div>
      <h2>Bets</h2>
      <ul>
        {Object.keys(betsByGame).map(gameId => (
          <li key={gameId}>
            <strong>
              {betsByGame[gameId][0].game.home_team} - {betsByGame[gameId][0].game.visitor_team} <br />
              {formatDate(new Date(betsByGame[gameId][0].game.date))}</strong>
            <br /><br />

            {betsByGame[gameId].map(bet => (
              <div key={bet.id}>
                <strong>Bet:</strong> <br />
                Goals for {bet.game.home_team}: {bet.goals_home} <br />
                Goals for {bet.game.visitor_team}: {bet.goals_visitor} <br />
                <br />
                Player: {bet.user.username} <br />
                <br />
              </div>
            ))}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bets;