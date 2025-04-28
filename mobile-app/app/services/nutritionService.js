import { API_URL } from "@/constants/Config";
import * as SecureStore from "expo-secure-store";

class NutritionService {
  async getCalorieOverview(startDate, endDate) {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const url = `${API_URL}/api/nutrition/calorie-overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
      const token = await SecureStore.getItemAsync("accessToken");
      const url = `${API_URL}/api/nutrition/daily-calories?date=${date.toISOString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
