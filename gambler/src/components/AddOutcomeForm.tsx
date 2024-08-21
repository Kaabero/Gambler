import { useState, useEffect } from 'react';
import { Outcome, Game, NewOutcome } from "../types";
import React from 'react';
import { getAllOutcomes, addOutcome } from '../services/outcomeService';
import { AxiosError } from 'axios';


interface AddOutcomeFormProps {
  game: Game;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddOutcomeForm: React.FC<AddOutcomeFormProps> = ({ game, setErrorMessage, setNotificationMessage }) => {
        
    const [visitorGoals, setVisitorGoals] = useState('');
    const [homeGoals, setHomeGoals] = useState('');
    const [outcomes, setOutcomes] = useState<Outcome[]>([]);
      
        useEffect(() => {
          getAllOutcomes().then(data => {
            setOutcomes(data);
          });
        }, []);
      
        const outcomeCreation = async (event: React.SyntheticEvent) => {
          event.preventDefault();
      
          try {
          
            const newOutcome: NewOutcome = {
                goals_home: homeGoals,
                goals_visitor: visitorGoals,
                game: game.id,
            };
            const savedOutcome = await addOutcome(newOutcome);
            setOutcomes(outcomes.concat(savedOutcome));
            setNotificationMessage('Outcome added successfully!');
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
      
        return (
          <div>
            <h2>Add a new outcome</h2>
            <form onSubmit={outcomeCreation}>
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
              <button type="submit">Add outcome</button>
              <br />
              <br />
            </form>
          </div>
        );
      };
      
    export default AddOutcomeForm;
      