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

  async calculateWeightGoal(weightGoalData) {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/goals/calculate-weight-goal`, weightGoalData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Invalid weight goal data");
      }
      throw error;
    }
  }

  async setWeightGoal(weightGoalData) {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/goals/set-weight-goal`, weightGoalData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Invalid weight goal data");
      }
      throw error;
    }
  }

  async getUserWeightGoal() {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/goals/weight-goal`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      throw error;
    }
  }

  async recalculateDailyCalories() {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/goals/recalculate-daily-calories`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Failed to recalculate daily calories");
      }
      throw error;
    }
  }
}

export default new GoalsService();
