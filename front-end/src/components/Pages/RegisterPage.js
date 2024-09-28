import React, { useContext, useEffect, useState } from "react";
import RegisterForm from "../Forms/RegisterForm";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import "../../css/RegisterAndLogin.css";

const RegisterPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, [isAuthenticated]);

  const checkAuthentication = () => {
    if (isAuthenticated === null) {
      setLoading(true);
    } else if (isAuthenticated) {
      navigate("/");
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return <RegisterForm />;
};

export default RegisterPage;
