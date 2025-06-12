import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class MealService {
  async getAllMeals() {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/meal/all-meals`);
      return response.data;
    } catch (error) {
      console.error("Error fetching meals:", error);
      throw error;
    }
  }

  async addMeal(mealData) {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/api/meal/add-meal`,
        mealData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding meal:", error);
      throw error;
    }
  }
}

export const mealService = new MealService();
