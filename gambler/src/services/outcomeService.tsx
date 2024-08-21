import axios from 'axios';
import { Outcome, NewOutcome } from "../types";

const baseUrl = '/api/outcomes'


export const getAllOutcomes = () => {
  return axios
    .get<Outcome[]>(baseUrl)
    .then(response => response.data)
 
}

export const addOutcome = async (newObject: NewOutcome) => {
  const response = await axios.post<Outcome>(baseUrl, newObject)
  return response.data
}


export const removeOutcome = (id: string) => {
 
  const request = axios.delete(`${ baseUrl }/${id}`)
  return request.then(response => response.data)
}


export const editOutcome = (id: string, newObject: Outcome) => {

  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}