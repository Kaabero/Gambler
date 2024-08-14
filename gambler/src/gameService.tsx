import axios from 'axios';
import { Game, NewGame } from "./types";

const baseUrl = 'http://localhost:3001/api/games'

export const getAllGames = () => {
  return axios
    .get<Game[]>(baseUrl)
    .then(response => response.data)
 
}

export const createGame = async (object: NewGame) => {
  try {
    return await axios
      .post<Game>(baseUrl, object)
      .then(response => response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('axios error')
      if (error.response) {
        console.log('errordata', error.response.data)
        console.log(typeof(error.response.data))
        throw new Error(error.response.data)
      }
      throw new Error('Something went wrong')
    } else {
      throw new Error('Something went wrong')
    }
  }
}