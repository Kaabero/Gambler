import axios from 'axios';

import { Scores, NewScores } from '../types';
import { token } from '../utils/setToken';
const baseUrl = '/api/scores';


export const getAllScores = async () => {
  const response = await axios
    .get<Scores[]>(baseUrl);
  return response.data;

};

export const getScoresById = async (id: string) => {
  const response = await axios
    .get<Scores>(`${baseUrl}/${id}`);
  return response.data;

};

export const addScores = async (newObject: NewScores) => {

  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Scores>(baseUrl, newObject, config);
  return response.data;
};



export const editScores = async (id: string, newObject: Scores) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  const response = await request;
  return response.data;
};