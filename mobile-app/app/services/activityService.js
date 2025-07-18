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

  getTodayDate() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  formatTime(timeSpan) {
    if (!timeSpan) return "00:00";

    const timeParts = timeSpan.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

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

  async addFavoriteActivityType(activityTypeId) {
    try {
      const url = `${API_URL}/api/activity/favorites/add`;
      const response = await axiosInstance.post(url, activityTypeId, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removeFavoriteActivityType(activityTypeId) {
    try {
      const url = `${API_URL}/api/activity/favorites/remove`;
      const response = await axiosInstance.post(url, activityTypeId, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async isFavoriteActivityType(activityTypeId) {
    try {
      const url = `${API_URL}/api/activity/favorites/${activityTypeId}/is-favorite`;
      const response = await axiosInstance.get(url);
      return response.data.isFavorite;
    } catch (error) {
      throw error;
    }
  }

  async getFavoriteActivityTypes() {
    try {
      const url = `${API_URL}/api/activity/favorites`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCustomActivityType({ name, activityCategoryId }) {
    try {
      const url = `${API_URL}/api/activity/custom-activity-type`;
      const payload = { name, activityCategoryId };
      const response = await axiosInstance.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPublicActivityTypes() {
    try {
      const url = `${API_URL}/api/activity/public-activity-types`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserCustomActivityTypes() {
    try {
      const url = `${API_URL}/api/activity/custom-activity-types`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const activityService = new ActivityService();
export default activityService;
