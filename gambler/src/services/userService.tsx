import axios from 'axios';
import { User, NewUser } from "../types";

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

