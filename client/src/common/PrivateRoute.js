import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component, isAuthenticated, role, ...rest }) => {
    return isAuthenticated ? <Component {...rest} role={role} /> : <Navigate to="/login" />;
};

export default PrivateRoute;