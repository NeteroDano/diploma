import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function Register({ handleLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/auth/register', {
                name,
                email,
                password
            });
            handleLogin();
            setMessage('User registered successfully');
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setMessage(error.response.data.errors.map(err => err.msg).join(', '));
            } else {
                setMessage('Error registering user');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-info vh-100">
            <div className='bg-white p-3 rounded w-25'> 
                <h2 className="mb-4">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            placeholder="Введіть ім'я"
                            className="form-control"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            placeholder='Введіть пошту'
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
                            placeholder="Введіть пароль"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-secondary mt-3" onClick={() => navigate('/login')}>Login</button>
                    <button type="submit" className="btn btn-success mt-3">Register</button>
                    </div>
                </form>
                {message && <p className="mt-3">{message}</p>}
            </div>
        </div>
    );
}

export default Register;
