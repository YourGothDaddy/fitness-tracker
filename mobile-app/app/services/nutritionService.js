import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class NutritionService {
  async getCalorieOverview(startDate, endDate, timeframe = null) {
    try {
      let url;
      if (timeframe) {
        url = `/api/nutrition/calorie-overview?timeframe=${timeframe}`;
      } else {
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        url = `/api/nutrition/calorie-overview?startDate=${formatDate(
          startDate
        )}&endDate=${formatDate(endDate)}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDailyCalories(date) {
    try {
      const url = `/api/nutrition/daily-calories?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMacronutrients(date) {
    try {
      const dateStr =
        date instanceof Date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
          : date;
      const url = `/api/nutrition/macronutrients?date=${dateStr}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEnergyExpenditure(date) {
    try {
      const dateStr =
        date instanceof Date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
          : date;
      const url = `/api/nutrition/energy-expenditure?date=${dateStr}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEnergyBudget(date) {
    try {
      const dateStr =
        date instanceof Date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
          : date;
      const url = `/api/nutrition/energy-budget?date=${dateStr}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMainTargets(date) {
    try {
      const url = `/api/nutrition/main-targets?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCarbohydrates(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/carbohydrates?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAminoAcids(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/amino-acids?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFats(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/fats?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMinerals(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/minerals?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getOtherNutrients(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/other?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSterols(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/sterols?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getVitamins(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/vitamins?date=${formattedDate}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEnergySettings({ customBmr, activityLevelId, includeTef }) {
    try {
      let url = `/api/nutrition/energy-settings?`;
      if (customBmr !== undefined && customBmr !== null)
        url += `customBmr=${customBmr}&`;
      if (activityLevelId !== undefined && activityLevelId !== null)
        url += `activityLevelId=${activityLevelId}&`;
      if (includeTef !== undefined) url += `includeTef=${includeTef}`;
      url = url.replace(/[&?]$/, "");
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserNutrientTargets() {
    try {
      const response = await axiosInstance.get(
        "/api/nutrition/user-nutrient-targets"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserNutrientTarget(model) {
    try {
      const response = await axiosInstance.post(
        "/api/nutrition/user-nutrient-targets",
        model
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const nutritionService = new NutritionService();
export default nutritionService;
