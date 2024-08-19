import axios from 'axios';
import { Game, NewGame } from "../types";

const baseUrl = '/api/games'

let token: string | null = null

export const setToken = (newToken: string) => {
  token = `Bearer ${newToken}`
}


export const getAllGames = () => {
  return axios
    .get<Game[]>(baseUrl)
    .then(response => response.data)
 
}

export const createGame = async (newObject: NewGame) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post<Game>(baseUrl, newObject, config)
  return response.data
}


