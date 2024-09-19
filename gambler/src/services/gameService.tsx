import axios from 'axios';

import { Game, NewGame } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/games';

export const getAllGames = () => {
  return axios
    .get<Game[]>(baseUrl)
    .then(response => response.data);

};

export const getGameById = (id: string) => {
  return axios
    .get<Game>(`${ baseUrl }/${id}`)
    .then(response => response.data);

};

export const createGame = async (newObject: NewGame) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Game>(baseUrl, newObject, config);
  return response.data;
};


export const removeGame = (id: string) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.delete(`${ baseUrl }/${id}`, config);
  return request.then(response => response.data);
};


export const editGame = (id: string, newObject: NewGame) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  return request.then(response => response.data);
};





