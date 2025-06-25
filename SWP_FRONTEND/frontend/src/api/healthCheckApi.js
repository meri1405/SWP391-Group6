import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with auth token
const healthCheckApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
healthCheckApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const healthCheckApi = {
  // Get all health check campaigns
  getAllCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get('/health-check/campaigns');
      return response.data;
    } catch (error) {
      console.error('Error fetching health check campaigns:', error);
      throw error;
    }
  },
  
  // Get campaigns created by current nurse
  getNurseCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get('/health-check/campaigns/nurse');
      return response.data;
    } catch (error) {
      console.error('Error fetching nurse health check campaigns:', error);
      throw error;
    }
  },
  
  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await healthCheckApiClient.get(`/health-check/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching health check campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Create new campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await healthCheckApiClient.post('/health-check/campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating health check campaign:', error);
      throw error;
    }
  },
  
  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await healthCheckApiClient.put(`/health-check/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      console.error(`Error updating health check campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Submit campaign for approval
  submitCampaignForApproval: async (id) => {
    try {
      const response = await healthCheckApiClient.post(`/health-check/campaigns/${id}/submit`);
      return response.data;
    } catch (error) {
      console.error(`Error submitting campaign ${id} for approval:`, error);
      throw error;
    }
  },
  
  // Schedule campaign
  scheduleCampaign: async (id, targetCount) => {
    try {
      const response = await healthCheckApiClient.post(`/health-check/campaigns/${id}/schedule?targetCount=${targetCount}`);
      return response.data;
    } catch (error) {
      console.error(`Error scheduling campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Start campaign
  startCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(`/health-check/campaigns/${id}/start`);
      return response.data;
    } catch (error) {
      console.error(`Error starting campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Complete campaign
  completeCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(`/health-check/campaigns/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error(`Error completing campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Cancel campaign
  cancelCampaign: async (id, notes) => {
    try {
      const response = await healthCheckApiClient.post(`/health-check/campaigns/${id}/cancel?notes=${encodeURIComponent(notes)}`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Get campaigns by status
  getCampaignsByStatus: async (status) => {
    try {
      const response = await healthCheckApiClient.get(`/health-check/campaigns/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns with status ${status}:`, error);
      throw error;
    }
  },
  
  // Get upcoming campaigns
  getUpcomingCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get('/health-check/campaigns/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming campaigns:', error);
      throw error;
    }
  },
  
  // Get completed campaigns
  getCompletedCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get('/health-check/campaigns/completed');
      return response.data;
    } catch (error) {
      console.error('Error fetching completed campaigns:', error);
      throw error;
    }
  },
  
  // Get available health check categories
  getAvailableCategories: async () => {
    try {
      const response = await healthCheckApiClient.get('/health-check/campaigns/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching health check categories:', error);
      throw error;
    }
  },
  
  // Get health check results by campaign
  getResultsByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(`/health-check/results/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching results for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Record health check result
  recordResult: async (resultData) => {
    try {
      const response = await healthCheckApiClient.post('/health-check/results', resultData);
      return response.data;
    } catch (error) {
      console.error('Error recording health check result:', error);
      throw error;
    }
  },
  
  // Schedule consultation for a result
  scheduleConsultation: async (resultId, consultationData) => {
    try {
      const response = await healthCheckApiClient.post(`/health-check/results/${resultId}/consultation`, consultationData);
      return response.data;
    } catch (error) {
      console.error(`Error scheduling consultation for result ${resultId}:`, error);
      throw error;
    }
  },

  // Get eligible students with flexible filtering (supports single/multiple classes, with/without age range)
  getEligibleStudentsWithFilters: async (campaignId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.minAge !== undefined && filters.minAge !== null) {
        params.append('minAge', filters.minAge);
      }
      if (filters.maxAge !== undefined && filters.maxAge !== null) {
        params.append('maxAge', filters.maxAge);
      }
      
      // Support both single className and multiple classNames
      if (filters.className) {
        params.append('classNames', filters.className);
      }
      if (filters.classNames && filters.classNames.length > 0) {
        filters.classNames.forEach(className => {
          params.append('classNames', className);
        });
      }
      
      const queryString = params.toString();
      const url = `/health-check/forms/campaign/${campaignId}/eligible-students${queryString ? `?${queryString}` : ''}`;
      
      const response = await healthCheckApiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching eligible students with filters for campaign ${campaignId}:`, error);
      throw error;
    }
  },

  // Generate forms for eligible students based on filters
  generateFormsForEligibleStudents: async (campaignId, filters = {}) => {
    try {
      // First get eligible students using the unified filter API
      const eligibleResponse = await healthCheckApi.getEligibleStudentsWithFilters(campaignId, filters);
      const studentIds = eligibleResponse.students.map(student => student.studentID);
      
      // Then generate forms for these students
      const response = await healthCheckApiClient.post(`/health-check/forms/campaign/${campaignId}/students`, studentIds);
      return response.data;
    } catch (error) {
      console.error(`Error generating forms for eligible students in campaign ${campaignId}:`, error);
      throw error;
    }
  },
};