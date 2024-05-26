import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ handleLogout, isAuthenticated }) => {
    const navigate = useNavigate();

    const logoutAndNavigate = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <div>
            <h2>Welcome to the Home Page</h2>
            {isAuthenticated && <button onClick={logoutAndNavigate} className="btn btn-danger">Logout</button>}
        </div>
    );
};

export default Home;
