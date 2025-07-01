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

  // Medical Event endpoints for Manager
  getAllMedicalEvents: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/medical-events");
      return response.data;
    } catch (error) {
      console.error("Error fetching all medical events for manager:", error);
      throw error;
    }
  },

  getPendingMedicalEvents: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/medical-events/pending");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching pending medical events for manager:",
        error
      );
      throw error;
    }
  },

  getMedicalEventById: async (eventId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(`/api/medical-events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical event ${eventId} for manager:`,
        error
      );
      throw error;
    }
  },

  getMedicalEventsByStudent: async (
    studentId,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/medical-events/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical events for student ${studentId}:`,
        error
      );
      throw error;
    }
  },

  getMedicalEventsByType: async (eventType, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/medical-events/type/${eventType}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical events by type ${eventType}:`,
        error
      );
      throw error;
    }
  },

  getMedicalEventsBySeverity: async (
    severityLevel,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/medical-events/severity/${severityLevel}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical events by severity ${severityLevel}:`,
        error
      );
      throw error;
    }
  },

  getMedicalEventsByDateRange: async (
    startDate,
    endDate,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/medical-events/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical events by date range:`, error);
      throw error;
    }
  },

  getMedicalEventsByClass: async (className, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/medical-events/class/${encodeURIComponent(className)}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching medical events for class ${className}:`,
        error
      );
      throw error;
    }
  },

  processMedicalEvent: async (eventId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.patch(
        `/api/medical-events/${eventId}/process`
      );
      return response.data;
    } catch (error) {
      console.error(`Error processing medical event ${eventId}:`, error);
      throw error;
    }
  },

  // Calculate medical event statistics (derived from the data)
  getMedicalEventStatistics: async (token = getTokenFromStorage()) => {
    try {
      const allEvents = await managerApi.getAllMedicalEvents(token);
      const pendingEvents = await managerApi.getPendingMedicalEvents(token);

      // Calculate statistics from the data
      const total = allEvents.length;
      const pending = pendingEvents.length;
      const resolved = total - pending;
      const emergency = allEvents.filter(
        (event) =>
          event.severityLevel === "HIGH" || event.severityLevel === "CRITICAL"
      ).length;

      return {
        total,
        emergency,
        resolved,
        pending,
      };
    } catch (error) {
      console.error("Error calculating medical event statistics:", error);
      // Return fallback data on error
      return {
        total: 0,
        emergency: 0,
        resolved: 0,
        pending: 0,
      };
    }
  },
};

export default managerApi;
