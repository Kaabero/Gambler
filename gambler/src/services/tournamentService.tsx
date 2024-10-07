import axios from 'axios';

import { Tournament } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/tournaments';

export const getAllTournaments = async () => {
  const response = await axios
    .get<Tournament[]>(baseUrl);
  return response.data;

};

export const getTournamentById = async (id: string) => {
  const response = await axios
    .get<Tournament>(`${baseUrl}/${id}`);
  return response.data;

};

export const createTournament = async (newObject: Tournament) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Tournament>(baseUrl, newObject, config);
  return response.data;
};


export const removeTournament = async (id: string) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.delete(`${ baseUrl }/${id}`, config);
  const response = await request;
  return response.data;
};


export const editTournament = async (id: string, newObject: Tournament) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  const response = await request;
  return response.data;
};
