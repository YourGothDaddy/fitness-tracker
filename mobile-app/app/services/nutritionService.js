import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class NutritionService {
  async getCalorieOverview(startDate, endDate) {
    try {
      const url = `/api/nutrition/calorie-overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDailyCalories(date) {
    try {
      const url = `/api/nutrition/daily-calories?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMacronutrients(date) {
    try {
      const url = `/api/nutrition/macronutrients?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const nutritionService = new NutritionService();
export default nutritionService;
