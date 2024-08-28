import axios from 'axios';
import { User, NewUser } from "../types";
import { token } from '../utils/setToken';

const baseUrl = '/api/users';



export const getAllUsers = () => {
  return axios
    .get<User[]>(baseUrl)
    .then(response => response.data);

};

export const getUserById = (id: string) => {
  return axios
    .get<User>(`${ baseUrl }/${id}`)
    .then(response => response.data);

};

export const createUser = async (newObject: NewUser) => {
  const response = await axios.post<User>(baseUrl, newObject);
  return response.data;

};

export const removeUser = (id: string) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.delete(`${ baseUrl }/${id}`, config);
  return request.then(response => response.data);
};

