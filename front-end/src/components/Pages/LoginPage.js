import React, { useState, useContext, useEffect } from 'react';
import Login from '../Forms/Login';
import { useNavigate } from 'react-router-dom';
import '../../css/Register.css';
import { AuthContext } from '../../Contexts/AuthContext'; 

const LoginPage = () => {
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated === null) {
      setLoading(true);
    } else if (isAuthenticated) {
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return null;
  }

  return <Login />;
};

export default LoginPage;
