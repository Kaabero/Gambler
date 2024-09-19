import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { removeBet } from '../services/betService';
import { getAllGames } from '../services/gameService';
import { getTournamentById } from '../services/tournamentService';
import { Bet, User, Game, Tournament } from '../types';
import { formatDate } from '../utils/dateUtils';

interface BetsProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  loggedUser: User,
  selectedTournament: string
}

const Bets: React.FC<BetsProps> = ({
  selectedTournament,
  loggedUser,
  setErrorMessage,
  setNotificationMessage
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [showAllGames, setShowAllGames] = useState(false);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1',
      name: 'TestTournament',
      from_date: new Date(),
      to_date: new Date() }
  );
  const [showAdminTools, setShowAdminTools] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then(setTournament);
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllGames().then((data) => {
      setGames(data);
    });
  }, []);

  const filteredGames = games.filter(
    (game) => game.tournament && game.tournament.id === tournament.id
  );

  const gamesWithBets = filteredGames
    .filter((game) => !game.bets || game.bets.length > 0);

  const sortedGames = [...gamesWithBets]
    .sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime());

  const futureGames = sortedGames
    .filter((game) => new Date(game.date) > new Date());

  const gamesToShow = showAllGames ? sortedGames : futureGames;

  const handleRemoveBetClick = async (id: string) => {
    try {
      await removeBet(id);
      setGames((initialGames) =>
        initialGames.map((game) => ({
          ...game,
          bets: game.bets?.filter((bet) => bet.id !== id),
        }))
      );
      setNotificationMessage('Bet deleted successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(`${error.response?.data.error}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleRadioChangeAdmin = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAdminTools(value === 'showadmin');
  };


  const handleEditBetClick = (bet: Bet) => {
    navigate(`/editBet/${bet.id}`);
  };

  const handleGoBackClick = () => {
    navigate(-1);
  };

  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAllGames(value === 'all');
  };

  return (
    <div>
      <hr />

      {gamesWithBets.length > 0 && (
        <>
          {loggedUser.admin && (
            <>
              <div>
                <label>
                  <input
                    type="radio"
                    value="hideadmin"
                    checked={!showAdminTools}
                    onChange={handleRadioChangeAdmin}
                  />
                Hide admin tools
                </label>
              </div>
              <div>
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
              <hr />
            </>
          )}
          <h2>Bets for tournament {tournament.name}</h2>
          <div>
            <div>
              <label>
                <input
                  type="radio"
                  value="future"
                  checked={!showAllGames}
                  onChange={handleRadioChange}
                />
                Show only future games
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={showAllGames}
                  onChange={handleRadioChange}
                />
                Show all games
              </label>
            </div>
            <>
              <ul>
                {gamesToShow.map((game) => (
                  <li key={game.id}>
                    <hr />
                    <strong>Game: </strong><br />
                    <br />
                    <div>
                      {formatDate(new Date(game.date))}
                      <br />
                      {game.home_team} - {game.visitor_team}
                      <br />
                    </div>
                    <br />
                    <ul>
                      {game.bets?.map((bet) => (
                        <li key={bet.id}>
                          <strong>Bet from user {bet.user.username}: </strong>
                          {bet.goals_home} - {bet.goals_visitor}
                          <br />
                          <br />
                          {loggedUser.admin &&
                          !game.outcome &&
                          showAdminTools && (
                            <>
                              <button onClick={() =>
                                handleRemoveBetClick(bet.id)}>
                                Delete bet
                              </button>
                              <button onClick={() =>
                                handleEditBetClick(bet)}>
                                  Edit bet
                              </button><br />
                              <br />
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          </div>
        </>
      )}
      {gamesWithBets.length === 0 && (
        <>
          <h2>Bets </h2>
          <p> There are no bets added to selected tournament </p>
        </>
      )}
      <hr />
      <br />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default Bets;