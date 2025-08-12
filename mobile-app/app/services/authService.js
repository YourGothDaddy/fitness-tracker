import { API_URL } from "@/constants/Config";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const decodeToken = (token) => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedData = JSON.parse(decodeFromBase64(base64));
      return decodedData;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const decodeFromBase64 = (base64String) => {
  try {
    // For React Native
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    let str = base64String.replace(/=+$/, "");

    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return decodeURIComponent(
      output
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (error) {
    return "{}";
  }
};

const tokenNeedsRefresh = async () => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const timeLeft = Math.floor((expiresAt - now) / 1000);

    // If token expires in less than 30 seconds, refresh it
    return timeLeft < 30;
  } catch (error) {
    return true;
  }
};

let refreshTokenPromise = null;

const refreshTokenSingleton = async () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${API_URL}/api/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      await Promise.all([
        SecureStore.setItemAsync("accessToken", accessToken),
        SecureStore.setItemAsync("refreshToken", newRefreshToken),
      ]);

      resolve(accessToken);
    } catch (error) {
      reject(error);
    } finally {
      refreshTokenPromise = null;
    }
  });

  return refreshTokenPromise;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Check if token needs refresh before making the request
      if (await tokenNeedsRefresh()) {
        try {
          await refreshTokenSingleton();
        } catch (refreshError) {
          // Continue with request, response interceptor will handle 401 if needed
        }
      }

      // Always get the latest token
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If the error is due to token expiration and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use the singleton refresh method
        const newToken = await refreshTokenSingleton();

        // Update the original request's authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        await Promise.all([
          SecureStore.deleteItemAsync("accessToken"),
          SecureStore.deleteItemAsync("refreshToken"),
        ]);

        // Return a specific error that can be handled by components
        return Promise.reject({ logout: true, error: refreshError });
      }
    }

    // If backend returns 400 with user-related issues, surface a logout hint
    if (
      error.response?.status === 400 &&
      typeof error.response?.data === "string" &&
      error.response.data.toLowerCase().includes("user not found")
    ) {
      return Promise.reject({ logout: true, error });
    }

    return Promise.reject(error);
  }
);

class AuthService {
  async login(email, password, ipAddress = "127.0.0.1") {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
          ipAddress,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const { accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid response format from server");
      }

      await Promise.all([
        SecureStore.setItemAsync("accessToken", accessToken),
        SecureStore.setItemAsync("refreshToken", refreshToken),
      ]);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (refreshToken) {
        try {
          await axiosInstance.post("/api/auth/logout", { refreshToken });
        } catch (logoutError) {
          // Continue with local logout
        }
      }

      await Promise.all([
        SecureStore.deleteItemAsync("accessToken"),
        SecureStore.deleteItemAsync("refreshToken"),
      ]);
    } catch (error) {
      // Still delete tokens even if server logout fails
      await Promise.all([
        SecureStore.deleteItemAsync("accessToken"),
        SecureStore.deleteItemAsync("refreshToken"),
      ]);
      throw error;
    }
  }

  async refreshToken() {
    try {
      return await refreshTokenSingleton();
    } catch (error) {
      throw error;
    }
  }

  async isAuthenticated() {
    try {
      // Check if we have a token and if it's valid (or can be refreshed)
      if (await tokenNeedsRefresh()) {
        try {
          await this.refreshToken();
          return true;
        } catch (error) {
          return false;
        }
      }

      const accessToken = await SecureStore.getItemAsync("accessToken");
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
export default axiosInstance;
