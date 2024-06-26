import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function Register({ handleLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            alert('User registered successfully');
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.data.errors) {
                alert(error.response.data.errors.map(err => err.msg).join(', '));
            } else {
                alert('Error registering user');
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
                            placeholder="Enter name"
                            className="form-control"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                        />
                    </div>
                    <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-secondary mt-3" onClick={() => navigate('/login')}>Login</button>
                    <button type="submit" className="btn btn-success mt-3">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
