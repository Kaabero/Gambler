import axios from 'axios';

import { Game, NewGame } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/games';

export const getAllGames = async () => {
  const response = await axios
    .get<Game[]>(baseUrl);
  return response.data;

};

export const getGameById = async (id: string) => {
  const response = await axios
    .get<Game>(`${baseUrl}/${id}`);
  return response.data;

};

export const createGame = async (newObject: NewGame) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Game>(baseUrl, newObject, config);
  return response.data;
};


export const removeGame = async (id: string) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.delete(`${ baseUrl }/${id}`, config);
  const response = await request;
  return response.data;
};


export const editGame = async (id: string, newObject: NewGame) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  const response = await request;
  return response.data;
};





