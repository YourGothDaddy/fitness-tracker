import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class ActivityService {
  async getActivityOverview(date) {
    try {
      console.log(
        "[ActivityService] Fetching activity overview for date:",
        date,
        "ISO:",
        date.toISOString()
      );
      const url = `${API_URL}/api/activity/activity-overview?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      console.log("[ActivityService] Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[ActivityService] Error fetching activity overview:",
        error
      );
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

  async getActivityTypes() {
    try {
      const url = `${API_URL}/api/activity/types`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addActivity({
    durationInMinutes,
    timeOfDay,
    caloriesBurned,
    activityTypeId,
    date,
    notes,
    isPublic = true,
  }) {
    try {
      const url = `${API_URL}/api/activity/add`;
      // Map timeOfDay string to enum index
      const timeOfDayEnumMap = {
        Morning: 0,
        Afternoon: 1,
        Evening: 2,
        Night: 3,
      };
      const timeOfTheDayEnum = timeOfDayEnumMap[timeOfDay];
      const payload = {
        durationInMinutes: Number(durationInMinutes),
        timeOfTheDay: timeOfTheDayEnum,
        caloriesBurned: Number(caloriesBurned),
        activityTypeId: Number(activityTypeId),
        date: date,
        notes: notes,
        isPublic: isPublic,
      };
      const response = await axiosInstance.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getExerciseMetaData() {
    try {
      const url = `${API_URL}/api/activity/exercise-metadata`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const activityService = new ActivityService();
export default activityService;
