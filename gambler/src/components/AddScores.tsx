import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Outcome } from "../types";
import React from 'react';
import { getOutcomeById } from '../services/outcomeService';
import { useNavigate } from 'react-router-dom';

interface AddScoresFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AddScoresForm: React.FC<AddScoresFormProps> = ({ setErrorMessage, setNotificationMessage }) => {
  const { outcomeId } = useParams(); 
  const [outcome, setOutcome] = useState<Outcome>({ id: '1', goals_home: "1", goals_visitor: "1", game: { id: '1', date: new Date() , home_team: 'HomeTeam', visitor_team: 'VisitorTeam' }});
  const navigate = useNavigate();
  

  useEffect(() => {
    if (outcomeId) {
      getOutcomeById(outcomeId).then(setOutcome); 
    }
  }, [outcomeId]);

  const handleCancel = () => {
    navigate('/'); 
    setErrorMessage('')
    setNotificationMessage('')
  };

  return (
    <div>
      <h2>Add scores to players</h2>
      <h3>Game:</h3>
      <p>{outcome.game.home_team}-{outcome.game.visitor_team}</p>
      <h3>Outcome:</h3>
      <p>{outcome.goals_home}-{outcome.goals_visitor}</p>
      <button type="button" onClick={handleCancel}>Cancel</button>
    
    </div>
  );
};

export default AddScoresForm;