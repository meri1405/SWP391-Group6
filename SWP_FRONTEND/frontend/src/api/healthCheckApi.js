import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with auth token
const healthCheckApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
healthCheckApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
healthCheckApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication failed, redirecting to login...');
      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Health Check Categories enum mapping
export const HEALTH_CHECK_CATEGORIES = {
  VISION: 'VISION',
  HEARING: 'HEARING', 
  ORAL: 'ORAL',
  SKIN: 'SKIN',
  RESPIRATORY: 'RESPIRATORY'
};

export const HEALTH_CHECK_CATEGORY_LABELS = {
  VISION: 'Khám mắt',
  HEARING: 'Khám tai',
  ORAL: 'Khám răng miệng',
  SKIN: 'Khám da liễu',
  RESPIRATORY: 'Khám hô hấp'
};

export const CAMPAIGN_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

export const CAMPAIGN_STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  IN_PROGRESS: 'Đang tiến hành',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy'
};

export const healthCheckApi = {
  // ==================== NURSE ENDPOINTS ====================
  
  /**
   * Create a new health check campaign
   * @param {Object} campaignData - Campaign data matching CreateHealthCheckCampaignRequest
   * @returns {Promise} Campaign DTO
   */
  createCampaign: async (campaignData) => {
    try {
      // Transform frontend data to match backend DTO structure
      const payload = {
        name: campaignData.name,
        description: campaignData.description,
        startDate: campaignData.startDate, // Already in ISO format from form
        endDate: campaignData.endDate, // Already in ISO format from form
        location: campaignData.location,
        categories: campaignData.categories, // Array of HealthCheckCategory enums
        minAge: campaignData.minAge,
        maxAge: campaignData.maxAge,
        targetClasses: campaignData.targetClasses // Array of class names
      };

      const response = await healthCheckApiClient.post(
        "/nurse/health-check-campaigns",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating health check campaign:", error);
      throw error;
    }
  },

  /**
   * Get campaigns created by the authenticated nurse
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise} Paginated campaign list
   */
  getMyCampaigns: async (page = 0, size = 10) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/my-campaigns?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching my health check campaigns:", error);
      throw error;
    }
  },

  /**
   * Get all campaigns created by current nurse (no pagination)
   * @returns {Promise} Array of campaigns
   */
  getAllNurseCampaigns: async () => {
    try {
      // Get a large page to simulate getting all campaigns
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/my-campaigns?page=0&size=1000`
      );
      return response.data.content || response.data;
    } catch (error) {
      console.error("Error fetching all nurse health check campaigns:", error);
      throw error;
    }
  },

  /**
   * Get campaign by ID
   * @param {number} id - Campaign ID
   * @returns {Promise} Campaign DTO
   */
  getCampaignById: async (id) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching health check campaign ${id}:`, error);
      throw error;
    }
  },

   /**
   * Schedule a health check campaign with time slots and target count
   * @param {number} id - Campaign ID
   * @param {Object} scheduleData - Schedule data including timeSlot, scheduleNotes and optional targetCount
   * @returns {Promise} Updated campaign DTO
   */
  scheduleCampaign: async (id, scheduleData) => {
    try {
      console.log(`Calling API to schedule campaign ${id} with data:`, scheduleData);
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/${id}/schedule`,
        scheduleData
      );
      console.log('Schedule campaign response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error scheduling health check campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update a campaign (only if status is PENDING)
   * @param {number} id - Campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise} Updated campaign DTO
   */
  updateCampaign: async (id, campaignData) => {
    try {
      // Transform frontend data to match backend DTO structure
      const payload = {
        name: campaignData.name,
        description: campaignData.description,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        location: campaignData.location,
        categories: campaignData.categories,
        minAge: campaignData.minAge,
        maxAge: campaignData.maxAge,
        targetClasses: campaignData.targetClasses
      };

      const response = await healthCheckApiClient.put(
        `/nurse/health-check-campaigns/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating health check campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Start a campaign (change status to IN_PROGRESS)
   * @param {number} id - Campaign ID
   * @returns {Promise} Updated campaign DTO
   */
  startCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/${id}/start`
      );
      return response.data;
    } catch (error) {
      console.error(`Error starting health check campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Complete a campaign
   * @param {number} id - Campaign ID
   * @returns {Promise} Updated campaign DTO
   */
  completeCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/${id}/complete`
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing health check campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get eligible students for a campaign
   * @param {number} id - Campaign ID
   * @returns {Promise} Array of student DTOs
   */
  getEligibleStudents: async (id) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/${id}/eligible-students`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching eligible students for campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get eligible students with form status for a campaign
   * @param {number} id - Campaign ID
   * @returns {Promise} Array of student data with form status
   */
  getEligibleStudentsWithFormStatus: async (id) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/${id}/eligible-students-with-status`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching eligible students with form status for campaign ${id}:`, error);
      throw error;
    }
  },

  // ==================== MANAGER ENDPOINTS ====================

  /**
   * Get campaigns by status for manager review
   * @param {string} status - Campaign status (PENDING, APPROVED, etc.)
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise} Paginated campaign list
   */
  getCampaignsByStatus: async (status = 'PENDING', page = 0, size = 10) => {
    try {
      const response = await healthCheckApiClient.get(
        `/manager/health-check-campaigns?status=${status}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns by status ${status}:`, error);
      throw error;
    }
  },
  
  /**
   * Get campaign details by ID for manager
   * This uses the status filter API to get a specific campaign by ID
   * @param {number} id - Campaign ID
   * @returns {Promise} Campaign DTO
   */
  getCampaignByIdForManager: async (id) => {
    try {
      // First, try to find it in pending campaigns
      let campaigns = await healthCheckApi.getAllCampaignsByStatus('PENDING');
      let campaign = campaigns.find(c => c.id === id);
      
      // If not found, check approved campaigns
      if (!campaign) {
        campaigns = await healthCheckApi.getAllCampaignsByStatus('APPROVED');
        campaign = campaigns.find(c => c.id === id);
      }
      
      // If not found, check in-progress campaigns
      if (!campaign) {
        campaigns = await healthCheckApi.getAllCampaignsByStatus('IN_PROGRESS');
        campaign = campaigns.find(c => c.id === id);
      }
      
      // If not found, check completed campaigns
      if (!campaign) {
        campaigns = await healthCheckApi.getAllCampaignsByStatus('COMPLETED');
        campaign = campaigns.find(c => c.id === id);
      }
      
      // If not found, check canceled campaigns
      if (!campaign) {
        campaigns = await healthCheckApi.getAllCampaignsByStatus('CANCELED');
        campaign = campaigns.find(c => c.id === id);
      }
      
      if (!campaign) {
        throw new Error(`Campaign with id ${id} not found`);
      }
      
      return campaign;
    } catch (error) {
      console.error(`Error fetching health check campaign ${id} for manager:`, error);
      throw error;
    }
  },

  /**
   * Get all campaigns by status (no pagination)
   * @param {string} status - Campaign status
   * @returns {Promise} Array of campaigns
   */
  getAllCampaignsByStatus: async (status) => {
    try {
      const response = await healthCheckApiClient.get(
        `/manager/health-check-campaigns?status=${status}&page=0&size=1000`
      );
      return response.data.content || response.data;
    } catch (error) {
      console.error(`Error fetching all campaigns by status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Approve a campaign
   * @param {number} id - Campaign ID
   * @returns {Promise} Updated campaign DTO
   */
  approveCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/manager/health-check-campaigns/${id}/approve`
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving health check campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reject a campaign
   * @param {number} id - Campaign ID
   * @param {string} notes - Rejection notes
   * @returns {Promise} Updated campaign DTO
   */
  rejectCampaign: async (id, notes) => {
    try {
      const response = await healthCheckApiClient.post(
        `/manager/health-check-campaigns/${id}/reject`,
        { notes }
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting health check campaign ${id}:`, error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get available health check categories
   * @returns {Promise} Array of category strings
   */
  getAvailableCategories: async () => {
    try {
      // Return the predefined categories since they're static enums
      return Object.values(HEALTH_CHECK_CATEGORIES);
    } catch (error) {
      console.error("Error fetching health check categories:", error);
      throw error;
    }
  },

  /**
   * Calculate target count based on age and class criteria
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age  
   * @param {Array} targetClasses - Array of target class names
   * @returns {Promise} Object with targetCount
   */
  calculateTargetCount: async (minAge, maxAge, targetClasses = []) => {
    try {
      const payload = {
        minAge,
        maxAge,
        targetClasses
      };

      const response = await healthCheckApiClient.post(
        "/nurse/health-check-campaigns/calculate-target-count",
        payload
      );
      
      return response.data;
    } catch (error) {
      console.error("Error calculating target count:", error);
      return { targetCount: 0 };
    }
  },

  /**
   * Get all campaigns without pagination (fallback method)
   * @returns {Promise} Array of campaigns
   */
  getAllCampaignsNoPagination: async () => {
    try {
      // Try to get campaigns from multiple sources
      const nurseCampaigns = await healthCheckApi.getAllNurseCampaigns();
      return nurseCampaigns;
    } catch (error) {
      console.error("Error fetching all campaigns:", error);
      throw error;
    }
  },

  /**
   * Generate health check forms for eligible students
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Response with generated forms count
   */
  generateForms: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/${campaignId}/generate-forms`
      );
      return response.data;
    } catch (error) {
      console.error("Error generating health check forms:", error);
      throw error;
    }
  },

  /**
   * Send notifications to parents for health check campaign
   * @param {number} campaignId - Campaign ID
   * @param {string} customMessage - Optional custom notification message
   * @returns {Promise} Response with notification status
   */
  sendNotificationsToParents: async (campaignId, customMessage = null) => {
    try {
      // Only include message in payload if it's a non-empty string after trimming
      let payload = {};
      if (customMessage && customMessage.trim().length > 0) {
        payload = { message: customMessage.trim() };
      }
      
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/${campaignId}/send-notifications`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error sending notifications to parents:", error);
      throw error;
    }
  },

  /**
   * Get all health check forms for a specific campaign
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Response with forms data
   */
  getFormsByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/${campaignId}/forms`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching forms by campaign:", error);
      throw error;
    }
  },

  /**
   * Record health check result for a student
   * @param {Object} resultData - Health check result data
   * @returns {Promise} Success response
   */
  recordHealthCheckResult: async (resultData) => {
    try {
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/record-result`,
        resultData
      );
      return response.data;
    } catch (error) {
      console.error('Error recording health check result:', error);
      throw error;
    }
  },

  /**
   * Get confirmed students for a campaign (for recording results)
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Array of confirmed students
   */
  getConfirmedStudents: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/${campaignId}/confirmed-students`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting confirmed students:', error);
      throw error;
    }
  },

  /**
   * Get health check results for a campaign
   * @param {number} campaignId - Campaign ID
   * @returns {Promise} Array of student results
   */
  getCampaignResults: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/nurse/health-check-campaigns/${campaignId}/results`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting campaign results:', error);
      throw error;
    }
  },

  /**
   * Send health check results to parents
   * @param {number} campaignId - Campaign ID
   * @param {Array} studentIds - List of student IDs to send results for (optional)
   * @param {string} customMessage - Optional custom message to include (optional)
   * @returns {Promise} Response with sent count
   */
  sendHealthCheckResults: async (campaignId, studentIds, customMessage) => {
    try {
      const response = await healthCheckApiClient.post(
        `/nurse/health-check-campaigns/${campaignId}/send-results`,
        { 
          studentIds: studentIds || [],
          customMessage: customMessage || ""
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error sending health check results for campaign ${campaignId}:`, error);
      throw error;
    }
  },
};

export default healthCheckApi;