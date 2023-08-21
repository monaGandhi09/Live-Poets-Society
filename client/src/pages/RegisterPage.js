import '../styles/App.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { TextField, Button } from '@mui/material'
import AlertDialog from '../components/Alert.js'

const config = require('../config.json');

export default function RegisterPage() {

    const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('NA');
    const [password, setPassword] = useState('');  
    const [name, setName] = useState('');
    const [resp, setResp] = useState('');
    const [showAlert, setShowAlert] = useState(false)

    const registerUser = async function() {
        setEmail(email ?? "NA")
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            //body: JSON.stringify({ title: 'React Hooks PUT Request Example' })
        };
        return await fetch(`http://${config.server_host}:${config.server_port}/register_user/${username}/${email}/${password}/${name}`, requestOptions)
            .then(response => { 
                return response.text()
        })
    };

    const InvalidFields = function() {
        return (username.length === 0 || password.length === 0 || name.length === 0)
      }

    const handleRegister = async () => {
        const invalid = InvalidFields()
        if (invalid) {
            setResp("ERROR: One or More Required Fields Are Empty.")
            setShowAlert(true)
            return
        }
        const res = await registerUser()
        setResp(res)
        setShowAlert(true)
    }

    const alertButtonOptions = [
        {'key': 1, 'text': 'Return to Login', 'url': '/login/'},
        {'key': 2, 'text': 'Stay on Register', 'url': '/register/'}
    ]

    return (
        <div className="text-center m-5-auto" style={flexFormat}>
            <AlertDialog text={resp} show={showAlert} buttonOptions={alertButtonOptions}/>
            <div>
                <h2>Register today</h2>
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
                        <label>Email</label><br/>
                        <TextField
                            label='email'
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", height: "75%" }}
                            inputProps={{ maxLength: 50 }}
                        />
                    </p>
                    <p>
                        <label>Password</label><br/>
                        <TextField
                            required
                            type='password'                         
                            label='password'
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", height: "75%" }}
                            inputProps={{ maxLength: 25 }}
                        />
                    </p>
                    <p>
                        <label>Name</label><br/>
                        <TextField
                            required
                            label='name'
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: "100%", height: "75%" }}
                            inputProps={{ maxLength: 100 }}
                        />
                    </p>
                    <p>
                        <Button
                            id="sub_btn"
                            onClick={handleRegister}
                        >
                                Register
                        </Button>
                    </p>
                </form>
                <footer>
                    <p><Link to="/login">Back to Login</Link>.</p>
                </footer>
            </div>
        </div>
    )
}