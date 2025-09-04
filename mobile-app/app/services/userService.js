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
      throw error;
    }
  }

  async getPremiumStatus() {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/api/user/premium-status`
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  }

  // Upload avatar image
  async uploadAvatar(imageUri) {
    try {
      const formData = new FormData();
      // Extract filename and type from URI
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split(".").pop();
      formData.append("avatar", {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      });
      const response = await axiosInstance.post(
        `${API_URL}/api/user/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.AvatarUrl;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
