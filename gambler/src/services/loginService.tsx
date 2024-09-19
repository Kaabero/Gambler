import axios from 'axios';

import { Credentials } from '../types';

const baseUrl = '/api/login';

interface LoginProps {
    username: string,
    password: string,
}

const login = async (credentials: LoginProps) => {
  const response = await axios.post<Credentials>(baseUrl, credentials);
  return response.data;
};

export default { login };