import axios from 'axios';

import { User, NewUser } from '../types';
import { token } from '../utils/setToken';

const baseUrl = '/api/users';



export const getAllUsers = async () => {
  const response = await axios
    .get<User[]>(baseUrl);
  return response.data;

};

export const getUserById = async (id: string) => {
  const response = await axios
    .get<User>(`${baseUrl}/${id}`);
  return response.data;

};

export const createUser = async (newObject: NewUser) => {
  const response = await axios.post<User>(baseUrl, newObject);
  return response.data;

};

export const removeUser = async (id: string) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.delete(`${ baseUrl }/${id}`, config);
  const response = await request;
  return response.data;
};

export const editUser = async (id: string, newObject: User) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  const response = await request;
  return response.data;
};

