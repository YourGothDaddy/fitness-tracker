import React, { useState, useContext, useEffect } from "react";
import LoginForm from "../Forms/LoginForm";
import { useNavigate } from "react-router-dom";
import "../../css/RegisterAndLogin.css";
import { AuthContext } from "../../Contexts/AuthContext";

const LoginPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleAuthentication();
  }, [isAuthenticated]);

  const handleAuthentication = () => {
    if (isAuthenticated === null) {
      setLoading(true);
    } else if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return <LoginForm />;
};

export default LoginPage;
