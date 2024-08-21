import { useState, useEffect } from 'react';
import { Bet } from "../types";
import { getAllBets } from '../services/betService';
import React from 'react';


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
            <strong>{bet.game.home_team}</strong><br />
            Goals: {bet.goals_home} <br />
            <br />
            <strong>{bet.game.visitor_team}</strong><br />
            Goals: {bet.goals_visitor} <br />
            <br />
            User: {bet.user.username} <br />
          </li>
        )}
      </ul>
    </div>
  );
};

export default Bets;