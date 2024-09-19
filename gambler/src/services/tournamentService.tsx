import axios from 'axios';

import { Tournament } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/tournaments';

export const getAllTournaments = () => {
  return axios
    .get<Tournament[]>(baseUrl)
    .then(response => response.data);

};

export const getTournamentById = (id: string) => {
  return axios
    .get<Tournament>(`${ baseUrl }/${id}`)
    .then(response => response.data);

};

export const createTournament = async (newObject: Tournament) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Tournament>(baseUrl, newObject, config);
  return response.data;
};


export const removeTournament = (id: string) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.delete(`${ baseUrl }/${id}`, config);
  return request.then(response => response.data);
};


export const editTournament = (id: string, newObject: Tournament) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  return request.then(response => response.data);
};
