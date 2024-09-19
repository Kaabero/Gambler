import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { getAllBets } from '../services/betService';
import { getAllScores } from '../services/scoreService';
import { getTournamentById } from '../services/tournamentService';
import { getUserById } from '../services/userService';
import { User, Scores, Tournament, Bet, Outcome } from '../types';
import { formatDate } from '../utils/dateUtils';




interface UsersPointsProps {
  selectedTournament: string;
}

const UsersPoints: React.FC<UsersPointsProps> = ( { selectedTournament }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User>(
    { id: '1', username: 'TestUser', password: 'Password', admin: false }
  );
  const [scores, setScores] = useState<Scores[]>([]);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1',
      name: 'TestTournament',
      from_date: new Date(),
      to_date: new Date() }
  );
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setTournament(data);
      });
    }
  }, [selectedTournament]);


  useEffect(() => {
    if (userId) {
      getUserById(userId).then(setUser);
    }
  }, [userId]);

  useEffect(() => {
    getAllScores().then((data) => {
      setScores(data);
    });
  }, []);

  const filteredScores = scores.filter(
    (score) => score.user && score.user.id === user.id
  );

  useEffect(() => {
    getAllBets().then((data) => {
      setBets(data);
    });
  }, []);




  const handleGoBackClick = () => {
    navigate(-1);
  };


  const sortedScores = [...filteredScores]
    .sort((a, b) =>
      new Date(a.outcome.game.date).getTime()
    - new Date(b.outcome.game.date).getTime());

  const tournamentScores = sortedScores
    .filter(score => score.outcome.game.tournament?.id === tournament.id);

  const usersBet = (user: User, outcome: Outcome): string => {
    const bet = bets
      .find((bet) =>
        bet.user && bet.user.id === user.id && bet.game.id === outcome.game.id
      );
    return `${bet?.goals_home}-${bet?.goals_visitor}`;
  };

  return (
    <div>
      <hr />

      {tournamentScores?.length > 0 ? (
        <>
          <h2>{user.username}'s points in tournament {tournament.name}</h2>
          <ul>
            {tournamentScores.map(score => <li key={score.id}>
              <hr />
              <strong>Game: </strong><br />
              <br />
              {formatDate(new Date(score.outcome.game.date))}<br />
              <br />
              {score.outcome.game.home_team}-
              {score.outcome.game.visitor_team} <br />
              <br />
              <strong>Result: </strong>
              {score.outcome.goals_home}-
              {score.outcome.goals_visitor} <br />
              <br />

              <strong>Bet:</strong> {usersBet(score.user, score.outcome)}<br />
              <br />
              <strong>Points:</strong> {score.points}<br />
              <br />
            </li>
            )}
          </ul>
        </>
      ) : (
        <>
          <h2>User's points</h2>
          <p>There are no points in the selected tournament for this user</p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default UsersPoints;