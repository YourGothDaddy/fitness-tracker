import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('https://localhost:7009/api/user/authstatus', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('User is not authenticated');
      }

      const user = await response.json();
      setIsAuthenticated(true);
      setUserInfo(user);
    } catch (err) {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('https://localhost:7009/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email, Password: password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      await checkAuthStatus();
    } catch (err) {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  };

  const logout = async () => {
    try {
      await fetch('https://localhost:7009/api/user/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
