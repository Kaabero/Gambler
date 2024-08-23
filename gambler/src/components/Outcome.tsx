import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game } from "../types";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameById } from '../services/gameService';


interface OutcomeFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const Outcome: React.FC<OutcomeFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
    const { gameId } = useParams(); 
    const [game, setGame] = useState<Game>(
      { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
    );
    const navigate = useNavigate();
      
    useEffect(() => {
      if (gameId) {
        getGameById(gameId).then(setGame); 
      }
    }, [gameId]);

    const handleGoHome = () => {
      navigate('/'); 
      setErrorMessage('')
      setNotificationMessage('')
    };
      
    console.log('game', game)
    return (
      <div>
        <h2>Game:</h2>
        <p>{game.home_team}-{game.visitor_team}</p>
        <h2>Outcome:</h2>
        <p>{game.outcome?.goals_home}-{game.outcome?.goals_visitor}</p>

        <button type="button" onClick={handleGoHome}>Go back home</button>
      </div>
    );
};
      
export default Outcome;
      