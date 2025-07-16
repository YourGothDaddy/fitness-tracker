import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class WeightService {
  async getWeightProgress(startDate, endDate) {
    try {
      const url = `${API_URL}/api/weight/weight-progress?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addWeightRecord(date, weight, notes = "") {
    try {
      const url = `${API_URL}/api/weight/record`;
      const response = await axiosInstance.post(url, {
        date: date.toISOString(),
        weight,
        notes,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateWeightRecord(recordId, weight, notes = "") {
    try {
      const url = `${API_URL}/api/weight/record/${recordId}`;
      const response = await axiosInstance.put(url, {
        weight,
        notes,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteWeightRecord(recordId) {
    try {
      const url = `${API_URL}/api/weight/record/${recordId}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  getWeekDates() {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    return { startDate, endDate: today };
  }
}

export const weightService = new WeightService();
export default weightService;
