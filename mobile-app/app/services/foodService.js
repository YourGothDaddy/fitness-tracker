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

// Helper function to format request details for logging
const formatRequestDetails = (params) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

export async function searchConsumableItems(
  searchQuery = "",
  pageNumber = 1,
  pageSize = 20,
  filter = "All"
) {
  // Ensure searchQuery is never undefined
  const requestParams = {
    searchQuery: searchQuery || "",
    pageNumber,
    pageSize,
    filter,
  };
  console.log(
    "[Food Service] Starting search request:",
    formatRequestDetails(requestParams)
  );

  try {
    const response = await axiosInstance.get(`/api/consumable/search`, {
      params: requestParams,
    });

    console.log(
      `[Food Service] Search successful. Received ${
        response.data.items?.length || 0
      } items`,
      `(Total: ${response.data.totalCount || 0})`
    );

    return response.data;
  } catch (error) {
    console.error("[Food Service] Search failed:", {
      params: requestParams,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    });

    // Check for specific error types
    if (error.response) {
      // Server responded with error
      console.error("[Food Service] Server error response:", {
        status: error.response.status,
        data: error.response.data,
      });

      if (error.response.status === 401) {
        throw new Error("Authentication required. Please log in.");
      }

      if (error.response.status === 400) {
        throw new Error(
          error.response.data.message || "Invalid search parameters."
        );
      }

      throw new Error(
        error.response.data.message ||
          error.response.data.details ||
          "Server error while searching foods."
      );
    }

    if (error.request) {
      // Request made but no response
      console.error("[Food Service] No response received from server");
      throw new Error("No response from server. Please check your connection.");
    }

    // Something else went wrong
    console.error("[Food Service] Request setup error:", error.message);
    throw new Error("Failed to initiate search request.");
  }
}

export async function getPublicConsumableItemsPaged(
  pageNumber = 1,
  pageSize = 20
) {
  try {
    const response = await axiosInstance.get(`/api/consumable/paged`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch paged foods.");
  }
}
