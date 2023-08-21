import { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Divider} from '@mui/material';
import { Link } from 'react-router-dom'
import AlertDialog from '../components/Alert.js'

import '../styles/App.css'
const config = require('../config.json');

export default function LoginPage() {

  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resp, setResp] = useState('');
  const [showAlert, setShowAlert] = useState(false)

  const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };

  const loginUser = async function() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    return await fetch(`http://${config.server_host}:${config.server_port}/handle_login/${user_name}/${password}`, requestOptions)
        .then(response => {return response})
  };

  const getUserId = async function() {
    return await fetch(`http://${config.server_host}:${config.server_port}/get_user_id/${user_name}`)
      .then(res => {return res.json()})
  }

  const InvalidFields = function() {
    return (user_name.length === 0 || password.length === 0)
  }

  const handleLogin = async function() {
    const invalid = InvalidFields()
    if (invalid) {
      setResp("ERROR: One or More Required Fields Are Empty.")
      setShowAlert(true)
      return
    }
    const res = await loginUser()
    if (res.status == 200) {
      localStorage.setItem('logged_in', true)
      const id = (await getUserId())[0].id
      localStorage.setItem('user_id', id)
      window.open('/', '_self')
    }
    else {
      const text = await res.text()
      setResp(text)
      setShowAlert(true)
    }
}

  const alertButtonOptions = [
    {'key': 1, 'text': 'Try Again', 'url': '/login/'},
    {'key': 2, 'text': 'Sign Up', 'url': '/register/'}
  ]

    return (
      <div className="text-center m-5-auto" style={flexFormat}>
        <AlertDialog text={resp} show={showAlert} buttonOptions={alertButtonOptions}/>
        <div>
          <h2>Sign in:</h2>
          <form style={{width: '500px'}} action="/home">
              <p>
                  <label>Username</label><br/>
                  <TextField
                    required
                    label='username'
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: "100%", height: "75%" }}
                    inputProps={{ maxLength: 25 }}
                  />
              </p>
              <p>
                  <label>Password</label>
                  <br/>
                  <TextField
                    required
                    label='password'
                    type='password'
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", height: "75%" }}
                    inputProps={{ maxLength: 25 }}
                  />
              </p>
              <p>
                  <Button id="sub_btn" onClick={handleLogin}>Login</Button>
              </p>
          </form>
          <footer>
              <p>First time? <Link to="/register">Register now!</Link></p>
          </footer>
          </div>
      </div>
  );
}