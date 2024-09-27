import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { editTournament } from '../services/tournamentService';
import { getTournamentById } from '../services/tournamentService';
import { Tournament } from '../types';
import { formatSimpleDateForInput } from '../utils/dateUtils';
import { formatSimpleDate } from '../utils/dateUtils';

interface EditTournamentFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
}

const EditTournamentForm: React.FC<EditTournamentFormProps> = ({
  setTournaments,
  setErrorMessage,
  setNotificationMessage
}) => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (tournamentId) {
      getTournamentById(tournamentId).then(tournament => {
        setTournament(tournament);
        setFromDate(formatSimpleDateForInput(new Date(tournament.from_date)));
        setToDate(formatSimpleDateForInput(new Date(tournament.to_date)));
        setName(tournament.name);
      });
    }
  }, [tournamentId]);



  const tournamentEdition = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const hasGames = tournament &&
    tournament.games && tournament.games.length > 0;

    if (hasGames) {
      const proceed = confirm(
        `
        There are already games added to this tournament. 
        You cannot change the tournament time period! 
        Do you want to proceed with the other changes?
        `
      );
      if (!proceed) {
        return;
      }
    }
    if (fromDate === toDate || new Date(fromDate) >= new Date(toDate)) {
      setErrorMessage('Check the dates!');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;

    }

    if (tournament) {
      const updatedTournament: Tournament = {
        ...tournament,
        from_date: hasGames ? tournament.from_date : new Date(fromDate),
        to_date: hasGames ? tournament.to_date : new Date(toDate),
        name: name || tournament.name,
      };

      try {
        await editTournament(updatedTournament.id, updatedTournament);
        setTournaments(tournaments =>
          tournaments.map(tournament =>
            (tournament.id === updatedTournament.id ? updatedTournament
              : tournament))
        );
        setNotificationMessage('Tournament updated successfully!');
        setTimeout(() => {
          setNotificationMessage('');
        }, 3000);
        navigate(-1);
      } catch (error) {
        if (error instanceof AxiosError) {
          setErrorMessage(`${error.response?.data.error}`);
          setTimeout(() => {
            setErrorMessage('');
          }, 3000);
        }
      }
    } else {
      setErrorMessage('No tournament found.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  return (
    <div>

      <h2>Edit the tournament</h2>
      <hr />
      { tournament && (
        <div>
          <strong> Initial tournament information: </strong> <br />
          <p> Name: {tournament.name}</p>
          <p> {formatSimpleDate(new Date(tournament.from_date))}</p>
          <p> {formatSimpleDate(new Date(tournament.to_date))}</p>

          <hr />
          <strong> Edit tournament information: </strong> <br />
          <br />
          <form onSubmit={tournamentEdition}>
            <div>
            From:
              <br />
              <input
                data-testid='to'
                type='date'
                value={fromDate}
                onChange={({ target }) => setFromDate(target.value)}
              />
            </div>
            <br />
            <div>
            To:
              <br />
              <input
                data-testid='from'
                type='date'
                value={toDate}
                onChange={({ target }) => setToDate(target.value)}
              />
            </div>
            <br />
            <div>
          Tournament name:
              <br />
              <input
                data-testid='tournamentname'
                value={name}
                onChange={({ target }) => setName(target.value)}
              />
            </div>
            <br />
            <button type="submit">Save</button>
            <button type="button" onClick={handleGoBackClick}>Cancel</button>
            <br />
            <br />
          </form>
        </div>
      )}
      {!tournament && (
        <>
          <br />
          <p> No tournament selected for editing. </p>
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}
      <hr />
    </div>
  );
};

export default EditTournamentForm;
