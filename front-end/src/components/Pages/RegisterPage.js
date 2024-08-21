import React, { useContext, useEffect, useState } from 'react';
import Register from '../Forms/Register';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../Contexts/AuthContext';
import '../../css/Register.css';

const RegisterPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
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

  return <Register />;
}

export default RegisterPage;
