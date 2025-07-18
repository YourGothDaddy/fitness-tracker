import { API_URL } from "@/constants/Config";
import axiosInstance from "@/app/services/authService";

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

export async function getAllPublicConsumableItems() {
  try {
    const response = await axiosInstance.get(`/api/consumable/all`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch foods.");
  }
}

export async function addFavoriteConsumable(consumableItemId) {
  try {
    const response = await axiosInstance.post(
      `/api/consumable/favorites/add`,
      consumableItemId,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function removeFavoriteConsumable(consumableItemId) {
  try {
    const response = await axiosInstance.post(
      `/api/consumable/favorites/remove`,
      consumableItemId,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function isFavoriteConsumable(consumableItemId) {
  try {
    const response = await axiosInstance.get(
      `/api/consumable/favorites/${consumableItemId}/is-favorite`
    );
    return response.data.isFavorite;
  } catch (error) {
    throw error;
  }
}

export async function getFavoriteConsumables() {
  try {
    const response = await axiosInstance.get(`/api/consumable/favorites`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllCustomConsumableItems() {
  try {
    const response = await axiosInstance.get(`/api/consumable/custom`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch custom foods.");
  }
}
