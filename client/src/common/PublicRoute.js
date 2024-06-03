import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ component: Component, isAuthenticated }) => {
    return isAuthenticated ? <Navigate to="/" /> : <Component />;
};

export default PublicRoute;