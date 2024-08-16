import axios from 'axios';
import { Game, NewGame } from "../types";

const baseUrl = '/api/games'


export const getAllGames = () => {
  return axios
    .get<Game[]>(baseUrl)
    .then(response => response.data)
 
}

export const createGame = async (newObject: NewGame) => {
  const request = await axios.post<Game>(baseUrl, newObject)
  return request.data
}
