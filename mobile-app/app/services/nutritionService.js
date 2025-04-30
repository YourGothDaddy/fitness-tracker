import { API_URL } from "@/constants/Config";
import * as SecureStore from "expo-secure-store";

class NutritionService {
  async refreshToken() {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await response.json();
      await Promise.all([
        SecureStore.setItemAsync("accessToken", accessToken),
        SecureStore.setItemAsync("refreshToken", newRefreshToken),
      ]);

      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async fetchWithToken(url, options = {}) {
    try {
      let token = await SecureStore.getItemAsync("accessToken");

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        token = await this.refreshToken();

        // Retry the original request with new token
        return await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCalorieOverview(startDate, endDate) {
    try {
      const url = `${API_URL}/api/nutrition/calorie-overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const response = await this.fetchWithToken(url);

      if (!response.ok) {
        throw new Error("Failed to fetch calorie overview");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getDailyCalories(date) {
    try {
      const url = `${API_URL}/api/nutrition/daily-calories?date=${date.toISOString()}`;
      const response = await this.fetchWithToken(url);

      if (!response.ok) {
        throw new Error("Failed to fetch daily calories");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export const nutritionService = new NutritionService();
