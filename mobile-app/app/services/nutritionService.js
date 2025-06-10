import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

class NutritionService {
  async getCalorieOverview(startDate, endDate) {
    try {
      const url = `/api/nutrition/calorie-overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
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
      const url = `/api/nutrition/macronutrients?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEnergyExpenditure(date) {
    try {
      const url = `/api/nutrition/energy-expenditure?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEnergyBudget(date) {
    try {
      const url = `/api/nutrition/energy-budget?date=${date.toISOString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMainTargets(date) {
    try {
      const url = `/api/nutrition/main-targets?date=${date.toISOString()}`;
      console.log("Fetching main targets from:", url);
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error in getMainTargets:", error);
      throw error;
    }
  }

  async getCarbohydrates(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/carbohydrates?date=${formattedDate}`;
      console.log("Fetching carbohydrates from:", url);
      console.log("Date being sent:", formattedDate);

      const response = await axiosInstance.get(url);
      console.log("Carbohydrates response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCarbohydrates:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  }

  async getAminoAcids(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/amino-acids?date=${formattedDate}`;
      console.log("Fetching amino acids from:", url);
      console.log("Date being sent:", formattedDate);

      const response = await axiosInstance.get(url);
      console.log("Amino acids response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getAminoAcids:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  }

  async getFats(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/fats?date=${formattedDate}`;
      console.log("Fetching fats from:", url);
      console.log("Date being sent:", formattedDate);

      const response = await axiosInstance.get(url);
      console.log("Fats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getFats:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  }

  async getMinerals(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/minerals?date=${formattedDate}`;
      console.log("Fetching minerals from:", url);
      console.log("Date being sent:", formattedDate);

      const response = await axiosInstance.get(url);
      console.log("Minerals response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getMinerals:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  }

  async getOtherNutrients(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/other?date=${formattedDate}`;
      console.log("Fetching other nutrients from:", url);
      console.log("Date being sent:", formattedDate);

      const response = await axiosInstance.get(url);
      console.log("Other nutrients response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getOtherNutrients:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  }

  async getSterols(date) {
    try {
      const formattedDate = date.toISOString();
      const url = `/api/nutrition/sterols?date=${formattedDate}`;
      console.log("Fetching sterols from:", url);
      console.log("Date being sent:", formattedDate);

      const response = await axiosInstance.get(url);
      console.log("Sterols response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getSterols:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  }
}

export const nutritionService = new NutritionService();
export default nutritionService;
