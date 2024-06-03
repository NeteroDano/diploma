import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ handleLogout, isAuthenticated }) => {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Welcome to the Home Page</h2>
        </div>
    );
};

export default Home;
