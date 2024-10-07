import { AxiosError } from 'axios';
import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { createTournament } from '../services/tournamentService';
import { Tournament } from '../types';



interface AddTournamentFormProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
    setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
}

const AddTournamentForm: React.FC<AddTournamentFormProps> = ({
  setTournaments,
  setErrorMessage,
  setNotificationMessage
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();


  const tournamentCreation = async (event: React.SyntheticEvent) => {

    event.preventDefault();
    try {

      const newTournament: Tournament = {
        name: name,
        from_date: new Date(fromDate),
        to_date: new Date(toDate),
        id: '1'
      };

      const createdTournament = await createTournament(newTournament);

      setTournaments(tournaments => [...tournaments, createdTournament]);

      setNotificationMessage('Tournament added successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
      navigate('/adminTools');
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleGoBackClick = () => {

    navigate(-1);
  };


  return (
    <div>
      <hr />

      <div>
        <h2>Add a new tournament</h2>
        <form onSubmit={tournamentCreation}>

          <div>
            <br />
          From:
            <br />
            <input
              data-testid='from'
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
              data-testid='to'
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
          <button type="submit">Add</button>
          <button type="button" onClick={handleGoBackClick}>Cancel</button>
          <br />
          <br />
        </form>
      </div>
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default AddTournamentForm;
