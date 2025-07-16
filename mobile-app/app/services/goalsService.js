import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class GoalsService {
  async getUserGoals() {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/goals`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async updateUserGoals(goals) {
    try {
      const response = await axiosInstance.put(`${API_URL}/api/goals`, goals);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }
}

export default new GoalsService();
