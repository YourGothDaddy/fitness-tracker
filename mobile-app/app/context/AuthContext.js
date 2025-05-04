import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";
import { router } from "expo-router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        setIsLoading(false);

        if (!isAuth) {
          // Not authenticated, make sure we're not showing protected screens
          const path = router.state.key;
          if (path && !path.startsWith("/(auth)") && path !== "/") {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
