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
      // Format date in local time
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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
      console.error("Error adding meal:", error);
      throw error;
    }
  }
}

export const mealService = new MealService();
