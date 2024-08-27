import { useState, useEffect } from 'react';
import { Outcome } from "../types";
import { getAllOutcomes } from '../services/outcomeService';
import React from 'react';
import { formatDate } from '../utils/dateUtils';


const Outcomes = () => {

  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' } }
  ]);

  useEffect(() => {
    getAllOutcomes().then((data: React.SetStateAction<Outcome[]>) => {
      setOutcomes(data);
    });
  }, []);

  return (
    <div>
      <h2>Outcomes</h2>
      <ul>
        {outcomes.map(outcome =>
          <li key={outcome.id}>
            <strong>Game: {outcome.game.home_team}-{outcome.game.visitor_team} on {formatDate(new Date(outcome.game.date))}</strong><br />
            Outcome: {outcome.goals_home} - {outcome.goals_visitor} <br />
            <br />
          </li>
        )}
      </ul>
    </div>
  );
};

export default Outcomes;