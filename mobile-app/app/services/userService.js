import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class UserService {
  async getProfile() {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/user/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/api/user/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/api/user/change-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async updateNotifications(notificationsEnabled) {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/api/user/notifications`,
        {
          notificationsEnabled,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating notifications:", error);
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }
}

export default new UserService();
