import axios from 'axios';
import { Scores, NewScores } from "../types";
import { token } from '../utils/setToken';
const baseUrl = '/api/scores';


export const getAllScores = () => {
  return axios
    .get<Scores[]>(baseUrl)
    .then(response => response.data);

};

export const addScores = async (newObject: NewScores) => {

  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post<Scores>(baseUrl, newObject, config);
  return response.data;
};


export const removeScores = (id: string) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.delete(`${ baseUrl }/${id}`, config);
  return request.then(response => response.data);
};


export const editScores = (id: string, newObject: Scores) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  return request.then(response => response.data);
};