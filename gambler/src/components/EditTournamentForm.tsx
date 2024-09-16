import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tournament } from '../types';
import React from 'react';
import { formatSimpleDateForInput } from '../utils/dateUtils';

import { editTournament } from '../services/tournamentService';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getTournamentById } from '../services/tournamentService';
import { formatSimpleDate } from '../utils/dateUtils';

interface EditTournamentFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditTournamentForm: React.FC<EditTournamentFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
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


    if (tournament) {
      const updatedTournament: Tournament = {
        ...tournament,
        from_date: new Date(fromDate),
        to_date: new Date(toDate),
        name: name || tournament.name,
      };

      try {
        await editTournament(updatedTournament.id, updatedTournament);
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
