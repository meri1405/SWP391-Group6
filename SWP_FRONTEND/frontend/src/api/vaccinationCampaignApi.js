import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with auth token
const vaccinationApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
vaccinationApiClient.interceptors.request.use(
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

export const vaccinationCampaignApi = {
  // Get all vaccination campaigns
  getAllCampaigns: async () => {
    try {
      const response = await vaccinationApiClient.get(
        "/nurse/vaccination-campaigns"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination campaigns:", error);
      throw error;
    }
  },

  // Get my campaigns (created by current nurse)
  getMyCampaigns: async (page = 0, size = 10) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/my-campaigns?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching my vaccination campaigns:", error);
      throw error;
    }
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await vaccinationApiClient.post(
        "/nurse/vaccination-campaigns",
        campaignData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating vaccination campaign:", error);
      throw error;
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await vaccinationApiClient.put(
        `/nurse/vaccination-campaigns/${id}`,
        campaignData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    try {
      await vaccinationApiClient.delete(`/nurse/vaccination-campaigns/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  },

  // Get eligible students for a campaign
  getEligibleStudents: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/${campaignId}/eligible-students`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching eligible students for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Get count of eligible students for a vaccination rule
  getEligibleStudentsCountByRule: async (ruleId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/rules/${ruleId}/eligible-count`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching eligible students count for rule ${ruleId}:`,
        error
      );
      throw error;
    }
  },

  // Generate vaccination forms for eligible students
  generateForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.post(
        `/nurse/vaccination-campaigns/${campaignId}/generate-forms`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error generating forms for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Send forms to parents
  sendFormsToParents: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.post(
        `/nurse/vaccination-campaigns/${campaignId}/send-forms`
      );
      return response.data;
    } catch (error) {
      console.error(`Error sending forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },

  // Get all forms for a campaign
  getCampaignForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/${campaignId}/forms`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },

  // Get confirmed forms
  getConfirmedForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/${campaignId}/forms/confirmed`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching confirmed forms for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Get pending forms
  getPendingForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/${campaignId}/forms/pending`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching pending forms for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Get vaccination records for a campaign
  getCampaignRecords: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/vaccination-campaigns/${campaignId}/records`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching records for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Create vaccination record from confirmed form
  createVaccinationRecord: async (formId, recordData) => {
    try {
      const response = await vaccinationApiClient.post(
        `/nurse/vaccination-campaigns/forms/${formId}/records`,
        recordData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error creating vaccination record for form ${formId}:`,
        error
      );
      throw error;
    }
  },

  // Update vaccination record
  updateVaccinationRecord: async (recordId, recordData) => {
    try {
      const response = await vaccinationApiClient.put(
        `/nurse/vaccination-campaigns/records/${recordId}`,
        recordData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating vaccination record ${recordId}:`, error);
      throw error;
    }
  },

  // Request campaign completion (sends request to manager for approval)
  requestCampaignCompletion: async (campaignId, requestData = {}) => {
    try {
      console.log("Requesting campaign completion for campaign:", campaignId);
      console.log("Request data:", requestData);
      console.log(
        "Auth token:",
        localStorage.getItem("token") ? "Present" : "Missing"
      );

      const response = await vaccinationApiClient.post(
        `/nurse/campaign-completion/campaigns/${campaignId}/request-completion`,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error requesting completion for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Test nurse authentication
  testNurseAuth: async () => {
    try {
      const response = await vaccinationApiClient.get(
        `/nurse/campaign-completion/test-auth`
      );
      return response.data;
    } catch (error) {
      console.error("Error testing nurse auth:", error);
      throw error;
    }
  },
};

// Manager Vaccination Campaign APIs
export const managerVaccinationApi = {
  // Get pending campaigns for approval
  getPendingCampaigns: async (page = 0, size = 10) => {
    try {
      const response = await vaccinationApiClient.get(
        `/manager/vaccination-campaigns/pending?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending campaigns:", error);
      throw error;
    }
  },

  // Get campaigns by status
  getCampaignsByStatus: async (status, page = 0, size = 10) => {
    try {
      const response = await vaccinationApiClient.get(
        `/manager/vaccination-campaigns/status/${status}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns with status ${status}:`, error);
      throw error;
    }
  },

  // Get campaign details by ID
  getCampaignById: async (id) => {
    try {
      const response = await vaccinationApiClient.get(
        `/manager/vaccination-campaigns/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },

  // Approve a vaccination campaign
  approveCampaign: async (id) => {
    try {
      const response = await vaccinationApiClient.post(
        `/manager/vaccination-campaigns/${id}/approve`
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving campaign ${id}:`, error);
      throw error;
    }
  },

  // Reject a vaccination campaign
  rejectCampaign: async (id, reason) => {
    try {
      const response = await vaccinationApiClient.post(
        `/manager/vaccination-campaigns/${id}/reject`,
        {
          reason: reason,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting campaign ${id}:`, error);
      throw error;
    }
  },

  // Get campaign statistics
  getCampaignStatistics: async () => {
    try {
      const response = await vaccinationApiClient.get(
        "/manager/vaccination-campaigns/statistics"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching campaign statistics:", error);
      throw error;
    }
  },

  // Campaign Completion Request Management

  // Get pending completion requests
  getPendingCompletionRequests: async () => {
    try {
      const response = await vaccinationApiClient.get(
        "/manager/campaign-completion/pending"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending completion requests:", error);
      throw error;
    }
  },

  // Get completion request by ID
  getCompletionRequestById: async (requestId) => {
    try {
      const response = await vaccinationApiClient.get(
        `/manager/campaign-completion/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching completion request ${requestId}:`, error);
      throw error;
    }
  },

  // Approve completion request
  approveCompletionRequest: async (requestId, reviewNotes = null) => {
    try {
      const response = await vaccinationApiClient.post(
        `/manager/campaign-completion/${requestId}/approve`,
        reviewNotes ? { reviewNotes } : {}
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving completion request ${requestId}:`, error);
      throw error;
    }
  },

  // Reject completion request
  rejectCompletionRequest: async (requestId, reviewNotes) => {
    try {
      const response = await vaccinationApiClient.post(
        `/manager/campaign-completion/${requestId}/reject`,
        { reviewNotes }
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting completion request ${requestId}:`, error);
      throw error;
    }
  },

  // Get count of pending completion requests
  getPendingCompletionRequestsCount: async () => {
    try {
      const response = await vaccinationApiClient.get(
        "/manager/campaign-completion/pending/count"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending completion requests count:", error);
      throw error;
    }
  },
};

export default vaccinationCampaignApi;
