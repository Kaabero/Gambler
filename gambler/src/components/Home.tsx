import { useState, useEffect } from 'react';
import { Game } from "../types";
import { getAllGames } from '../gameService';
import React from 'react';
import Notification from './Notification'
import GameForm from './GameForm';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom"


const Home = () => {
    const padding = {
        padding: 5,
    };

    const [errormessage, setErrorMessage] = useState('');
    const [notificationmessage, setNotificationMessage] = useState('');
    const [games, setGames] = useState<Game[]>([
      { id: 1, date: '2023-02-13', home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }
    ]);
  
    useEffect(() => {
      getAllGames().then(data => {
        setGames(data);
      });
    }, []);
  
    return (
        <><div>
            <h2>Games</h2>
            <Notification errormessage={errormessage} notificationmessage={notificationmessage} />
            <ul>
                {games.map(game => <li key={game.id}>
                    <strong>{game.date}</strong><br />
                    Home Team: {game.home_team} <br />
                    Visitor Team: {game.visitor_team} <br />
                    <br />
                </li>
                )}
            </ul>
            
        </div><Router>
                <div>
                    <Link style={padding} to="/addGame">Add game</Link>
                </div>
                <Routes>
                    <Route path="/addGame" element={<GameForm setErrorMessage={setErrorMessage} setNotificationMessage={setNotificationMessage} />} />
                </Routes>
            </Router></>
    );
  };
  
  export default Home;