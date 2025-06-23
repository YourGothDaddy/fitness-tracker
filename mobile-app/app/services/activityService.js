import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class ActivityService {
  async getActivityOverview(date) {
    try {
      const url = `${API_URL}/api/activity/activity-overview?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getActivityOverviewForPeriod(startDate, endDate) {
    try {
      const url = `${API_URL}/api/activity/activity-overview-period?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Helper function to get today's date at midnight
  getTodayDate() {
    const today = new Date();
    // Set to midnight UTC to ensure consistent date comparison
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  // Helper function to format time from TimeSpan
  formatTime(timeSpan) {
    if (!timeSpan) return "00:00";

    // TimeSpan comes as "HH:mm:ss" from backend
    const timeParts = timeSpan.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Format as "HH:MM" (24-hour format)
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  async getActivityLevels() {
    try {
      const url = `${API_URL}/api/activity/activity-levels`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const activityService = new ActivityService();
export default activityService;
