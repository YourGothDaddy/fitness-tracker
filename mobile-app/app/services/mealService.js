import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class MealService {
  async getAllMeals() {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/meal/all-meals`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addMeal(mealData) {
    try {
      const formatDate = (date) => {
        const utcDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        return utcDate.toISOString();
      };
      const mealDataWithLocalTime = {
        ...mealData,
        date: formatDate(mealData.date),
      };
      const response = await axiosInstance.post(
        `${API_URL}/api/meal/add-meal`,
        mealDataWithLocalTime
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const mealService = new MealService();
