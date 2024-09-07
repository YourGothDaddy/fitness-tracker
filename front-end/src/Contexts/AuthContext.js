import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

const API_BASE_URL = "https://localhost:7009/api/user";

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    userInfo: null,
    isAdmin: false,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/authstatus`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("User is not authenticated");
      }

      const user = await response.json();
      setAuthState({
        isAuthenticated: true,
        userInfo: user,
        isAdmin: user.roles?.includes("Administrator") || false,
      });
    } catch (err) {
      setAuthState({ isAuthenticated: false, userInfo: null, isAdmin: false });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      await checkAuthStatus();
    } catch (err) {
      setAuthState({ isAuthenticated: false, userInfo: null, isAdmin: false });
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setAuthState({ isAuthenticated: false, userInfo: null, isAdmin: false });
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
