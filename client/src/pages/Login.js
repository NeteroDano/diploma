import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function Login({ handleLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const response = await axios.post('http://localhost:3000/auth/login', {
            const response = await axios.post('https://diploma-2507928da0ba.herokuapp.com/auth/login', {
                email,
                password
            });
            localStorage.setItem('token', response.data.token);
            handleLogin();
            setMessage('User logged in successfully');
            navigate('/');
        } catch (error) {
            console.log('Login error:', error);
            if (error.response && error.response.data.errors) {
                setMessage(error.response.data.errors.map(err => err.msg).join(', '));
            } else if (error.response) {
                setMessage(error.response.data);
            } else {
                setMessage('Error logging in user');
            }
        }
    };

    return (
        <div className="container vh-100 d-flex justify-content-center align-items-center bg-info">
            <div className="bg-white p-3 rounded w-25">
                <h2 className="mb-4">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary mt-3" onClick={() => navigate('/register')}>Register</button>
                        <button type="submit" className="btn btn-success mt-3">Login</button>
                    </div>
                </form>
                {message && <p className="mt-3">{message}</p>}
            </div>
        </div>
    );
}

export default Login;
