import axios from 'axios';

import { Outcome, NewOutcome } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/outcomes';


export const getAllOutcomes = async () => {
  const response = await axios
    .get<Outcome[]>(baseUrl);
  return response.data;

};

export const getOutcomeById = async (id: string) => {
  const response = await axios
    .get<Outcome>(`${baseUrl}/${id}`);
  return response.data;

};

export const addOutcome = async (newObject: NewOutcome) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Outcome>(baseUrl, newObject, config);
  return response.data;
};


export const removeOutcome = async (id: string) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.delete(`${ baseUrl }/${id}`, config);
  const response = await request;
  return response.data;
};
