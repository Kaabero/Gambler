import axios from 'axios'
import { Credentials } from '../types'

const baseUrl = '/api/users'

interface UsersProps {
    username: string,
    password: string
}

const register = async (credentials: UsersProps) => {
  const response = await axios.post<Credentials>(baseUrl, credentials)
  return response.data
}

export default { register }