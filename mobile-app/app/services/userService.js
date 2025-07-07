import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class UserService {
  async getProfile() {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/user/profile`);
      if (response.data && response.data.initials !== undefined) {
      } else {
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async getProfileData() {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/api/user/profile-data`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async updateProfileData(profileData) {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/api/user/profile-data`,
        profileData
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        if (error.response.data) {
          console.error("Error response data:", error.response.data);
        }
        if (error.response.status) {
          console.error("Error response status:", error.response.status);
        }
      }
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
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  // Macro settings
  async getMacroSettings() {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/api/user/macro-settings`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async updateMacroSettings(macroSettings) {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/api/user/macro-settings`,
        macroSettings
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }
}

export default new UserService();
