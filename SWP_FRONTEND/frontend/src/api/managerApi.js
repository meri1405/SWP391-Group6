import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Helper function to get token from localStorage
const getTokenFromStorage = () => {
  return localStorage.getItem("token");
};

// Create axios instance with auth header
const createAuthAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Manager API object
const managerApi = {
  // Notification endpoints for Manager
  getAllNotifications: async (token = getTokenFromStorage(), limit = null) => {
    try {
      const authAxios = createAuthAxios(token);
      const params = limit ? { limit } : {};
      const response = await authAxios.get("/api/notifications", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching all notifications for manager:", error);
      throw error;
    }
  },

  getUnreadNotifications: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/notifications/unread");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notifications for manager:", error);
      throw error;
    }
  },

  getUnreadNotificationCount: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/notifications/unread/count");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching unread notification count for manager:",
        error
      );
      throw error;
    }
  },

  markNotificationAsRead: async (
    notificationId,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read for manager:", error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put("/api/notifications/read-all");
      return response.data;
    } catch (error) {
      console.error(
        "Error marking all notifications as read for manager:",
        error
      );
      throw error;
    }
  },

  // Dashboard Statistics APIs
  getDashboardStatistics: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/manager/dashboard/statistics");
      return response.data;
    } catch (error) {
      console.error("Error fetching manager dashboard statistics:", error);
      throw error;
    }
  },

  getMonthlyTrends: async (
    year = new Date().getFullYear(),
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/manager/dashboard/monthly-trends?year=${year}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      throw error;
    }
  },

  getSystemOverview: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/manager/dashboard/system-overview"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching system overview:", error);
      throw error;
    }
  },
};

export default managerApi;
