import axios from 'axios';

import { Outcome, NewOutcome } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/outcomes';


export const getAllOutcomes = () => {
  return axios
    .get<Outcome[]>(baseUrl)
    .then(response => response.data);

};

export const getOutcomeById = (id: string) => {
  return axios
    .get<Outcome>(`${ baseUrl }/${id}`)
    .then(response => response.data);

};

export const addOutcome = async (newObject: NewOutcome) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Outcome>(baseUrl, newObject, config);
  return response.data;
};


export const removeOutcome = (id: string) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.delete(`${ baseUrl }/${id}`, config);
  return request.then(response => response.data);
};
