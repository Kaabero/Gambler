import { useState, useEffect } from 'react';
import { Bet, NewBet, Game, User } from "../types";
import React from 'react';
import { getAllBets, addBet } from '../services/betService';
import { AxiosError } from 'axios';


interface AddBetFormProps {
  game: Game;
  user: User;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setGameForBet: React.Dispatch<React.SetStateAction<Game | null>>;
}

const AddBetForm: React.FC<AddBetFormProps> = ({ game, setErrorMessage, setNotificationMessage, setGameForBet }) => {
        
    const [visitorGoals, setVisitorGoals] = useState('');
    const [homeGoals, setHomeGoals] = useState('');
    const [bets, setBets] = useState<Bet[]>([]);
      
        useEffect(() => {
          getAllBets().then(data => {
            setBets(data);
          });
        }, []);
      
        const betCreation = async (event: React.SyntheticEvent) => {
          event.preventDefault();
         

          try {
          
            const newBet: NewBet = {
                goals_home: homeGoals,
                goals_visitor: visitorGoals,
                game: game.id,
            };
          
            const savedBet = await addBet(newBet);
        
            setBets(bets.concat(savedBet));
            setNotificationMessage('Bet added successfully!');
            setTimeout(() => {
              setNotificationMessage('');
            }, 3000);
            setGameForBet(null)
            
          } catch (error) {
            if (error instanceof AxiosError) {
              setErrorMessage(`${error.response?.data.error}`);
              setTimeout(() => {
                setErrorMessage('');
              }, 3000);
              setGameForBet(null)
            }
          }
        };
      
        return (
          <div>
            <h2>Add a new bet</h2>
            <form onSubmit={betCreation}>
              <div>
                Goals for {game.home_team}: 
                <br />
                <input
                  value={homeGoals}
                  onChange={({ target }) => setHomeGoals(target.value)}
                />
              </div>
              <br />
              <div>
              Goals for {game.visitor_team}:
                <br />
                <input
                  value={visitorGoals}
                  onChange={({ target }) => setVisitorGoals(target.value)}
                />
              </div>
              <br />
              <button type="submit">Add bet</button>
              <br />
              <br />
            </form>
          </div>
        );
      };
      
    export default AddBetForm;