import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getAllTournaments,
  removeTournament
} from '../services/tournamentService';
import { User, Tournament } from '../types';
import { formatSimpleDate } from '../utils/dateUtils';

interface TournamentsProps {
  loggedUser: User;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setMainTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  setSelectedTournament: React.Dispatch<React.SetStateAction<string>>;
}

const Tournaments: React.FC<TournamentsProps> = ({
  loggedUser,
  setSelectedTournament,
  setMainTournaments,
  setErrorMessage,
  setNotificationMessage
}) => {
  const [tournaments, setTournamnets] = useState<Tournament[]>([]);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [showAllTournaments, setShowAllTournaments] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    getAllTournaments().then((data) => {
      setTournamnets(data);
    });
  }, []);


  const handleRemoveTournament = (id: string) => {
    try {

      if (confirm(
        `Deleting this tournament will also remove all 
        related games, bets, game results and scores!`
      )) {
        removeTournament(id).then(() => {
          setTournamnets(tournaments
            .filter(tournament => tournament.id !== id));
          setMainTournaments(tournaments
            .filter(tournament => tournament.id !== id));
          setSelectedTournament('');
          setNotificationMessage('Tournament deleted successfully!');
          setTimeout(() => {
            setNotificationMessage('');
          }, 3000);
        });
      } else {
        return;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleAddTournamentClick = () => {

    navigate('/addTournament');
  };


  const handleEditTournamentClick = (tournament: Tournament) => {
    navigate(`/editTournament/${tournament.id}`);
  };


  const handleRadioChangeTournaments = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAllTournaments(value === 'all');
  };

  const handleRadioChangeAdmin = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAdminTools(value === 'showadmin');
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };


  const sortedTournaments = [...tournaments]
    .sort((a, b) =>
      new Date(a.from_date).getTime()
    - new Date(b.from_date).getTime());

  const filteredTournaments = sortedTournaments
    .filter((tournament) => new Date(tournament.to_date) > new Date());

  const tournamentsToShow = showAllTournaments ? sortedTournaments
    : filteredTournaments;



  return (
    <div>
      <hr />

      <h2>Tournaments</h2>

      {sortedTournaments.length > 0 && (
        <>
          <div>
            {loggedUser.admin && (
              <div className="radio-group">

                <label>
                  <input
                    type="radio"
                    value="hideadmin"
                    checked={!showAdminTools}
                    onChange={handleRadioChangeAdmin}
                  />
                Hide admin tools
                </label>
                <label>
                  <input
                    type="radio"
                    value="showadmin"
                    checked={showAdminTools}
                    onChange={handleRadioChangeAdmin}
                  />
                Show admin tools
                </label>

              </div>
            )}


          </div>


          <div className="radio-group">

            <label>
              <input
                type="radio"
                value="ended"
                checked={!showAllTournaments}
                onChange={handleRadioChangeTournaments}
              />
                Don't show ended tournaments
            </label>

            <label>
              <input
                type="radio"
                value="all"
                checked={showAllTournaments}
                onChange={handleRadioChangeTournaments}
              />
                Show all tournaments
            </label>

          </div>

          <>
            <ul>
              {tournamentsToShow.map(tournament =>
                <li key={tournament.id}>
                  {tournament.name} <br />
                  {formatSimpleDate(new Date(tournament.from_date))} -&nbsp;
                  {formatSimpleDate(new Date(tournament.to_date))}<br />
                  Games: {tournament.games?.length} <br />

                  {loggedUser.admin && showAdminTools && (
                    <>
                      <br />
                      <button className= 'admin-button' onClick={() =>
                        handleRemoveTournament(tournament.id)}>
                          Delete tournament
                      </button>
                      <button className= 'admin-button' onClick={() =>
                        handleEditTournamentClick(tournament)}>
                          Edit tournament
                      </button> <br />
                      <br />
                    </>
                  )}
                </li>
              )}
            </ul>
          </>
          <hr />
          <br />
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}

      {sortedTournaments.length === 0 && (
        <>
          <p>There are no tournaments.</p>
          <button type="button" onClick={handleAddTournamentClick}>
            Add a tournament
          </button>
          <button type="button" onClick={handleGoBackClick}>Go back</button>
        </>
      )}

    </div>
  );
};

export default Tournaments;
