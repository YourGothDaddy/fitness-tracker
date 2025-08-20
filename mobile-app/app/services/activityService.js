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
    caloriesBurned,
    activityTypeId,
    title,
    date,
    isPublic = true,
  }) {
    try {
      const url = `${API_URL}/api/activity/add`;
      const payload = {
        durationInMinutes: Number(durationInMinutes),
        caloriesBurned: Number(caloriesBurned),
        activityTypeId: Number(activityTypeId),
        title,
        date: this.formatDate(date),
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
    exercise,
    effortLevel,
    durationInMinutes,
    terrainType,
  }) {
    try {
      const url = `${API_URL}/api/activity/calculate-exercise-calories`;
      const payload = {
        category,
        subcategory,
        exercise: exercise || null,
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
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString();
  }

  async trackExercise({
    category,
    subcategory,
    exercise,
    effortLevel,
    durationInMinutes,
    terrainType,
    date,
    isPublic = true,
  }) {
    try {
      const url = `${API_URL}/api/activity/track-exercise`;
      const payload = {
        category,
        subcategory,
        exercise: exercise || null,
        effortLevel,
        durationInMinutes: Number(durationInMinutes),
        terrainType: terrainType || null,
        date: this.formatDate(date),
        isPublic,
      };

      const response = await axiosInstance.post(url, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCategories() {
    try {
      const url = `${API_URL}/api/activity/categories`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSubcategories(category) {
    try {
      const url = `${API_URL}/api/activity/subcategories?category=${encodeURIComponent(
        category
      )}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getExercises(category, subcategory) {
    try {
      const url = `${API_URL}/api/activity/exercises?category=${encodeURIComponent(
        category
      )}&subcategory=${encodeURIComponent(subcategory)}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteActivity(activityId) {
    try {
      const url = `${API_URL}/api/activity/delete/${activityId}`;
      const response = await axiosInstance.delete(url);
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

  async getPublicActivityTypes() {
    try {
      const url = `${API_URL}/api/activity/public-activity-types`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Custom workout features removed
}

export const activityService = new ActivityService();
export default activityService;
