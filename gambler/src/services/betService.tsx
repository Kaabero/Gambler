import axios from 'axios';

import { Bet, NewBet } from '../types';
import { token } from '../utils/setToken';
const baseUrl = '/api/bets';


export const getAllBets = () => {
  return axios
    .get<Bet[]>(baseUrl)
    .then(response => response.data);

};

export const getBetById = (id: string) => {
  return axios
    .get<Bet>(`${ baseUrl }/${id}`)
    .then(response => response.data);

};

export const addBet = async (newObject: NewBet) => {

  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Bet>(baseUrl, newObject, config);
  return response.data;
};


export const removeBet = (id: string) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.delete(`${ baseUrl }/${id}`, config);
  return request.then(response => response.data);
};


export const editBet = (id: string, newObject: Bet) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  return request.then(response => response.data);
};