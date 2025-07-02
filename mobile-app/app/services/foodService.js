import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

/**
 * Adds a new food item (consumable) to the backend.
 * @param {object} foodData - The food item data to add.
 * @returns {Promise<object>} - The response from the backend.
 */
export async function addFoodItem(foodData) {
  try {
    const response = await axiosInstance.post(`/api/consumable/add`, foodData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.Message) {
      throw new Error(error.response.data.Message);
    }
    throw new Error("An error occurred while adding the food item.");
  }
}
