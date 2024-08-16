import React, { useState } from "react"
import loginService from '../services/login'
import { Credentials } from "../types";


interface LoginFormProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string>>;
  setUser: React.Dispatch<React.SetStateAction<Credentials | null | undefined>>;
}

const Login: React.FC<LoginFormProps> = ({ setErrorMessage, setNotificationMessage, setUser }) => {
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
   

  const handleLogin = async (event: { preventDefault: () => void; }) => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({
        username, password,
      })
      setUser(user)
      setUsername('')
      setPassword('')
      setNotificationMessage('Login successfully!');
      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setUsername('')
      setPassword('')
      setTimeout(() => {
        setErrorMessage('')
      }, 5000)
    }
  }
    return (
      <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
            <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
            <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
      </div>
    );
};
  
export default Login;