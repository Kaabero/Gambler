import axios from 'axios';

import { Bet, NewBet } from '../types';
import { token } from '../utils/setToken';
const baseUrl = '/api/bets';


export const getAllBets = async () => {
  const response = await axios
    .get<Bet[]>(baseUrl);
  return response.data;

};

export const getBetById = async (id: string) => {
  const response = await axios
    .get<Bet>(`${baseUrl}/${id}`);
  return response.data;

};

export const addBet = async (newObject: NewBet) => {

  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Bet>(baseUrl, newObject, config);
  return response.data;
};


export const removeBet = async (id: string) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.delete(`${ baseUrl }/${id}`, config);
  const response = await request;
  return response.data;
};


export const editBet = async (id: string, newObject: Bet) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  const response = await request;
  return response.data;
};