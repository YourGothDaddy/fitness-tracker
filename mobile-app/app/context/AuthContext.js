import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";
import userService from "../services/userService";
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
        if (!isAuth) {
          // Not authenticated, make sure we're not showing protected screens
          // Use optional chaining to avoid errors if router.state is undefined
          const path = router.state?.key;
          if (path && !path.startsWith("/(auth)") && path !== "/") {
            router.replace("/");
          }
          setUser(null);
          setIsLoading(false);
          return;
        }
        // Fetch profile
        try {
          const profile = await userService.getProfile();
          setUser(profile);
        } catch (e) {
          setUser({});
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      // After login, fetch profile
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch (e) {
        setUser({});
      }
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      router.replace("/");
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isPremium: !!(user?.IsPremium ?? user?.isPremium),
    login,
    logout,
    refreshUser: async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch (e) {}
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
