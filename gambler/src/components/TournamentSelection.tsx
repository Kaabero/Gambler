import React from 'react';
import {
  useLocation,
} from 'react-router-dom';

import { Credentials, Tournament } from '../types';
import { formatSimpleDate } from '../utils/dateUtils';




interface TournamentSelectionProps {
  user: Credentials | null | undefined;
  tournaments: Tournament[];
  selectedTournament: string;
  setSelectedTournament: React.Dispatch<React.SetStateAction<string>>;

}

const TournamentSelection: React.FC<TournamentSelectionProps> = ({
  user,
  tournaments,
  selectedTournament,
  setSelectedTournament,

}) => {
  const location = useLocation();





  const hideTournamentSelectionPaths = [
    '/login',
    '/editTournament',
    '/tournaments',
    '/addTournament',
    '/register',
    '/addBet/',
    '/gamesbets/',
    '/gamespoints/',
    '/addBet/',
    '/editGame/',
    '/editScores/',
    '/editBet/',
    '/addResult/',
    '/result/'
  ];

  const shouldShowTournamentSelection =
    user && !hideTournamentSelectionPaths.some((path) =>
      location.pathname.startsWith(path));


  return (
    <div>
      {shouldShowTournamentSelection && (
        <>
          <strong>Tournament:</strong>
          <br />
          <br />
          <select
            id="tournament-select"
            value={selectedTournament}
            onChange={({ target }) => setSelectedTournament(target.value)}
            required
          >
            <option value="" disabled>
              -- Select a tournament --
            </option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}:&nbsp;
                {formatSimpleDate(new Date(tournament.from_date))}-
                {formatSimpleDate(new Date(tournament.to_date))}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default TournamentSelection;
