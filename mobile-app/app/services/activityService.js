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

  async calculateExerciseCalories({
    category,
    subcategory,
    effortLevel,
    durationInMinutes,
    terrainType,
  }) {
    try {
      const url = `${API_URL}/api/activity/calculate-exercise-calories`;
      const payload = {
        category,
        subcategory,
        effortLevel,
        durationInMinutes: Number(durationInMinutes),
        terrainType: terrainType || null,
      };
      const response = await axiosInstance.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Helper to format date in local time (YYYY-MM-DDTHH:mm:ss)
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  async trackExercise({
    category,
    subcategory,
    effortLevel,
    durationInMinutes,
    terrainType,
    date,
    isPublic = true,
    notes = "",
  }) {
    try {
      const url = `${API_URL}/api/activity/track-exercise`;
      const payload = {
        category,
        subcategory,
        effortLevel,
        durationInMinutes: Number(durationInMinutes),
        terrainType: terrainType || null,
        date: this.formatDate(date),
        isPublic,
        notes,
      };
      const response = await axiosInstance.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const activityService = new ActivityService();
export default activityService;
