import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:5000/api";

const userService = {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      });
      if (response.data.token) {
        await AsyncStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/user/register`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getProfile() {
    try {
      const user = await this.getCurrentUser();
      if (!user || !user.token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateProfile(profileData) {
    try {
      const user = await this.getCurrentUser();
      if (!user || !user.token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(`${API_URL}/user/profile`, profileData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const user = await this.getCurrentUser();
      if (!user || !user.token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/user/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateNotifications(enabled) {
    try {
      const user = await this.getCurrentUser();
      if (!user || !user.token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/user/notifications`,
        {
          notificationsEnabled: enabled,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async logout() {
    try {
      const user = await this.getCurrentUser();
      if (user && user.token) {
        await axios.post(
          `${API_URL}/user/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
      }
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
      // Still remove the user data even if the server request fails
      await AsyncStorage.removeItem("user");
    }
  },

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || "An unexpected error occurred");
    }
  },
};

export default userService;
