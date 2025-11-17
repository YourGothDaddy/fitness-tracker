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

  async getMealsForDate(date) {
    try {
      const d = date instanceof Date ? date : new Date(date);
      const localMidnight = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      );
      const utcIso = new Date(
        localMidnight.getTime() - localMidnight.getTimezoneOffset() * 60000
      ).toISOString();
      const response = await axiosInstance.get(`${API_URL}/api/meal/all`, {
        params: { date: utcIso },
      });
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

  async updateMeal(mealId, updateData) {
    try {
      const formatDate = (date) => {
        if (!(date instanceof Date)) {
          return date;
        }
        const utcDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        return utcDate.toISOString();
      };

      const payload = {
        ...updateData,
        ...(updateData.date
          ? {
              date: formatDate(updateData.date),
            }
          : {}),
      };

      const response = await axiosInstance.put(
        `${API_URL}/api/meal/update/${mealId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteMeal(mealId) {
    try {
      const response = await axiosInstance.delete(
        `${API_URL}/api/meal/delete/${mealId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const mealService = new MealService();
