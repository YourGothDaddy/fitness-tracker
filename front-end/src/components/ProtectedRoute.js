import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useContext(AuthContext); 

    if (isAuthenticated === null) {
        return null;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
