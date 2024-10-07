import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllGames, removeGame } from '../services/gameService';
import { getTournamentById } from '../services/tournamentService';
import { Game, User, Tournament } from '../types';
import { formatDate } from '../utils/dateUtils';

interface GamesProps {
  loggedUser: User;
  selectedTournament: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Games: React.FC<GamesProps> = ({
  selectedTournament,
  loggedUser,
  setErrorMessage,
  setNotificationMessage
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [tournament, setTournament] = useState<Tournament>(
    { id: '1',
      name: 'TestTournament',
      from_date: new Date(),
      to_date: new Date() }
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTournament) {
      getTournamentById(selectedTournament).then((data) => {
        setTournament(data);
      });
    }
  }, [selectedTournament]);

  useEffect(() => {
    getAllGames().then((data) => {
      setGames(data);
    });
  }, []);


  const handleRemoveGame = (id: string) => {
    try {

      if (confirm(
        `Deleting this game will also remove related bets, 
        game results and scores!`
      )) {
        removeGame(id).then(() => {
          setGames(games.filter(game => game.id !== id));
          setNotificationMessage('Game deleted successfully!');
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


  const handleAddBetClick = (game: Game) => {

    navigate(`/addBet/${game.id}`);
  };

  const handleAddResultClick = (game: Game) => {

    navigate(`/addResult/${game.id}`);
  };

  const handleCheckResultClick = (game: Game) => {

    navigate(`/result/${game.id}`);
  };

  const handleCheckBetsClick = (game: Game) => {

    navigate(`/gamesbets/${game.id}`);
  };

  const userHasBet = (game: Game) => {
    return game.bets?.some(bet =>
      bet.user && bet.user.username === loggedUser.username);
  };


  const handleEditGameClick = (game: Game) => {
    navigate(`/editGame/${game.id}`);
  };

  const handleRadioChangeGames = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShowAllGames(value === 'all');
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



  const filteredGames = games.filter(
    (game) => game.tournament && game.tournament.id === tournament.id
  );

  const sortedGames = [...filteredGames]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const futureGames = sortedGames
    .filter((game) => new Date(game.date) > new Date());

  const gamesToShow = showAllGames ? sortedGames : futureGames;

  const now = new Date();



  return (
    <div>
      <hr />
      {filteredGames.length > 0 && (
        <>
          <h2>Games in tournament {tournament.name}</h2>

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
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="future"
                  checked={!showAllGames}
                  onChange={handleRadioChangeGames}
                />
                Show only future games
              </label>
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={showAllGames}
                  onChange={handleRadioChangeGames}
                />
                Show all games
              </label>
            </div>
            <hr />

            <>
              <ul>
                {gamesToShow.map(game =>
                  <li key={game.id}>
                    <strong>{formatDate(new Date(game.date))}</strong><br />
                    <br />
                  Home Team: {game.home_team} <br />
                  Visitor Team: {game.visitor_team} <br />
                    <br />
                    <button onClick={() =>
                      handleCheckBetsClick(game)}>
                        Check bets
                    </button>
                    {loggedUser &&
                    new Date(game.date) > now &&
                    !userHasBet(game) && (
                      <>
                        <button onClick={() =>
                          handleAddBetClick(game)}>
                            Add bet
                        </button>
                      </>
                    )}
                    {loggedUser && game.outcome &&(
                      <>
                        <button onClick={() =>
                          handleCheckResultClick(game)}>
                            Check result
                        </button>
                      </>
                    )}
                    {loggedUser.admin && showAdminTools && (
                      <>
                        <button className= 'admin-button' onClick={() =>
                          handleRemoveGame(game.id)}>
                            Delete game
                        </button>
                        <button className= 'admin-button' onClick={() =>
                          handleEditGameClick(game)}>
                            Edit game
                        </button>
                      </>
                    )}
                    {loggedUser.admin &&
                    !game.outcome &&
                    new Date(game.date) < new Date() &&
                    showAdminTools &&(
                      <>
                        <button className= 'admin-button' onClick={() =>
                          handleAddResultClick(game)}>
                            Add result and points
                        </button>
                      </>
                    )}
                    <br />
                  </li>
                )}
              </ul>
            </>
          </div>
        </>
      )}
      {filteredGames.length === 0 && (
        <>
          <h2>Games </h2>
          <p>There are no games added to the selected tournament.</p>
        </>
      )}
      <hr />
      <button type="button" onClick={handleGoBackClick}>Go back</button>
    </div>
  );
};

export default Games;
