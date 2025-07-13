import axios from "axios";

const API_BASE_URL = "https://swp391-group6.onrender.com";

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

  // Health Check Campaign Statistics API (new endpoint)
  getHealthCheckStatistics: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/manager/dashboard/health-check/statistics"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health check statistics:", error);
      // Return fallback data if API fails
      return {
        pending: 2,
        approved: 5,
        inProgress: 3,
        completed: 8,
        cancelled: 1,
        total: 19,
      };
    }
  },

  // Inventory Statistics API (new endpoint)
  getInventoryStatistics: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/manager/dashboard/inventory/statistics"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory statistics:", error);
      // Return fallback data if API fails
      return {
        totalSupplies: 156,
        lowStockItems: 23,
        outOfStockItems: 5,
        pendingRestockRequests: 4,
      };
    }
  },

  // Vaccination Campaign Management APIs
  getVaccinationCampaignsByStatus: async (
    status,
    page = 0,
    size = 10,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/manager/vaccination-campaigns/status/${status}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching vaccination campaigns with status ${status}:`,
        error
      );
      throw error;
    }
  },

  getPendingVaccinationCampaigns: async (
    page = 0,
    size = 10,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/manager/vaccination-campaigns/pending?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending vaccination campaigns:", error);
      throw error;
    }
  },

  getVaccinationCampaignById: async (id, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/manager/vaccination-campaigns/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccination campaign ${id}:`, error);
      throw error;
    }
  },

  approveVaccinationCampaign: async (id, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/manager/vaccination-campaigns/${id}/approve`
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving vaccination campaign ${id}:`, error);
      throw error;
    }
  },

  rejectVaccinationCampaign: async (
    id,
    reason,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/manager/vaccination-campaigns/${id}/reject`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting vaccination campaign ${id}:`, error);
      throw error;
    }
  },

  completeCampaign: async (id, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/manager/vaccination-campaigns/${id}/complete`
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing vaccination campaign ${id}:`, error);
      throw error;
    }
  },

  getVaccinationCampaignStatistics: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/manager/vaccination-campaigns/statistics"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination campaign statistics:", error);
      throw error;
    }
  },

  // Medical Event Statistics API for Manager
  getMedicalEventStatistics: async (
    params = {},
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append("period", params.period);
      if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) queryParams.append("dateTo", params.dateTo);

      console.log(
        "Fetching medical event statistics for manager with params:",
        params
      );

      const response = await authAxios.get(
        `/api/manager/dashboard/medical-events/statistics?${queryParams}`
      );

      console.log(
        "Medical event statistics received for manager:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching medical event statistics for manager:",
        error
      );
      // Return fallback data if API fails
      return {
        total: 89,
        emergency: 12,
        resolved: 76,
        pending: 13,
      };
    }
  },

  // Debug endpoint to test authentication
  testManagerAuth: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      // Use simple test auth endpoint
      const response = await authAxios.get(
        "/api/manager/campaign-completion/test-auth"
      );
      return response.data;
    } catch (error) {
      console.error("Manager auth test failed:", error);
      throw error;
    }
  },

  // Campaign Completion Request Management APIs
  approveCompletionRequest: async (
    requestId,
    reason = "",
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/manager/campaign-completion/${requestId}/approve`,
        { reviewNotes: reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving completion request ${requestId}:`, error);
      throw error;
    }
  },

  rejectCompletionRequest: async (
    requestId,
    reason,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/manager/campaign-completion/${requestId}/reject`,
        { reviewNotes: reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting completion request ${requestId}:`, error);
      throw error;
    }
  },

  getAllCompletionRequests: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/manager/campaign-completion");
      return response.data;
    } catch (error) {
      console.error("Error fetching completion requests:", error);
      throw error;
    }
  },

  getPendingCompletionRequests: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/manager/campaign-completion/pending"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending completion requests:", error);
      throw error;
    }
  },

  // Find completion request by campaign name or create new one
  findOrCreateCompletionRequest: async (
    campaignName,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);

      // First try to get all pending completion requests
      const response = await authAxios.get(
        "/api/manager/campaign-completion/pending"
      );
      const pendingRequests = response.data;

      // Find request for this campaign
      const existingRequest = pendingRequests.find(
        (request) =>
          request.campaignName === campaignName ||
          request.campaign?.name === campaignName ||
          request.vaccinationCampaign?.name === campaignName
      );

      if (existingRequest) {
        console.log("Found existing completion request:", existingRequest);
        return existingRequest;
      }

      // If no existing request found, log available requests for debugging
      console.log("No completion request found for campaign:", campaignName);
      console.log("Available pending requests:", pendingRequests);

      throw new Error(
        `No completion request found for campaign: ${campaignName}`
      );
    } catch (error) {
      console.error(
        `Error finding completion request for campaign ${campaignName}:`,
        error
      );
      throw error;
    }
  },

  // Manager Profile endpoints
  getManagerProfile: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/manager/dashboard/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching manager profile:", error);
      throw error;
    }
  },

  updateManagerProfile: async (profileData, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put("/api/manager/dashboard/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating manager profile:", error);
      throw error;
    }
  },
};

export default managerApi;
