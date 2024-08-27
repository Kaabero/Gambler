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

  return (
    <div>
      <h2>Bets</h2>
      <ul>
        {bets.map(bet =>
          <li key={bet.id}>
            <strong>Game: {bet.game.home_team}-{bet.game.visitor_team} on {formatDate(new Date(bet.game.date))}</strong><br />
            <br />
            Bet: <br />
            Goals for {bet.game.home_team}: {bet.goals_home} <br />
            Goals for {bet.game.visitor_team}: {bet.goals_visitor} <br />
            <br />
            Player: {bet.user.username} <br />
            <br />
          </li>
        )}
      </ul>
    </div>
  );
};

export default Bets;