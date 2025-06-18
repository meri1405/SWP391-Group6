import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with auth token
const vaccinationApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
vaccinationApiClient.interceptors.request.use(
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

export const vaccinationCampaignApi = {
  // Get all vaccination campaigns
  getAllCampaigns: async () => {
    try {
      const response = await vaccinationApiClient.get('/nurse/vaccination-campaigns');
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination campaigns:', error);
      throw error;
    }
  },
  
  // Get my campaigns (created by current nurse)
  getMyCampaigns: async (page = 0, size = 10) => {
    try {
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/my-campaigns?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my vaccination campaigns:', error);
      throw error;
    }
  },
  
  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Create new campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await vaccinationApiClient.post('/nurse/vaccination-campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating vaccination campaign:', error);
      throw error;
    }
  },
  
  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await vaccinationApiClient.put(`/nurse/vaccination-campaigns/${id}`, campaignData);
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
  getEligibleStudents: async (id) => {
    try {
      // Đảm bảo id là số và chuyển đổi về dạng số nếu cần
      const numericId = Number(id);
      if (isNaN(numericId)) {
        console.error(`Invalid campaign ID: ${id} is not a number`);
        throw new Error(`Invalid campaign ID: ${id} is not a number`);
      }
      
      // Trước khi gọi API eligible-students, kiểm tra status của campaign
      try {
        const campaign = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${numericId}`);
        if (campaign.data && campaign.data.status !== 'APPROVED') {
          console.warn(`Campaign ${numericId} has status ${campaign.data.status}, not APPROVED`);
          // Return empty result with status message instead of throwing error
          return {
            eligibleStudents: [],
            ineligibleStudents: [],
            message: `Chiến dịch chưa được phê duyệt. Cần được phê duyệt trước khi xem danh sách học sinh.`,
            campaignStatus: campaign.data.status
          };
        }
      } catch (campaignError) {
        console.error(`Error checking campaign status: ${campaignError}`);
        // Continue with the eligible-students API call anyway
      }
      
      console.log(`Fetching eligible students for campaign ID: ${numericId}`);
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${numericId}/eligible-students`);
      
      // Log response thành công để debug
      console.log('Eligible students API response:', response.status);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching eligible students for campaign ${id}:`, error);
      
      // Log chi tiết hơn về lỗi để dễ debug
      if (error.response) {
        // Server trả về lỗi với status code
        console.error('Error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Kiểm tra trường hợp Bad Request do campaign chưa được phê duyệt
        if (error.response.status === 400 && 
            error.response.data && 
            error.response.data.message && 
            error.response.data.message.includes('approved')) {
          return {
            eligibleStudents: [],
            ineligibleStudents: [],
            message: 'Chiến dịch chưa được phê duyệt. Cần được phê duyệt trước khi xem danh sách học sinh.',
            error: true
          };
        }
      } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        console.error('No response received:', error.request);
      } else {
        // Lỗi khi thiết lập request
        console.error('Error setting up request:', error.message);
      }
      
      // Return standardized error object with empty lists
      return {
        eligibleStudents: [],
        ineligibleStudents: [],
        message: `Lỗi khi tải danh sách học sinh: ${error.response?.data?.message || error.message}`,
        error: true
      };
    }
  },
  
  // Generate vaccination forms
  generateForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.post(`/nurse/vaccination-campaigns/${campaignId}/generate-forms`);
      return response.data;
    } catch (error) {
      console.error(`Error generating forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Send forms to parents
  sendFormsToParents: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.post(`/nurse/vaccination-campaigns/${campaignId}/send-forms`);
      return response.data;
    } catch (error) {
      console.error(`Error sending forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Get all forms for a campaign
  getCampaignForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${campaignId}/forms`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Get confirmed forms
  getConfirmedForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${campaignId}/forms/confirmed`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching confirmed forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Get pending forms
  getPendingForms: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${campaignId}/forms/pending`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Get vaccination records for a campaign
  getCampaignRecords: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.get(`/nurse/vaccination-campaigns/${campaignId}/records`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching records for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  // Create vaccination record from confirmed form
  createVaccinationRecord: async (formId, recordData) => {
    try {
      const response = await vaccinationApiClient.post(`/nurse/vaccination-campaigns/forms/${formId}/records`, recordData);
      return response.data;
    } catch (error) {
      console.error(`Error creating vaccination record for form ${formId}:`, error);
      throw error;
    }
  },
  
  // Update vaccination record
  updateVaccinationRecord: async (recordId, recordData) => {
    try {
      const response = await vaccinationApiClient.put(`/nurse/vaccination-campaigns/records/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      console.error(`Error updating vaccination record ${recordId}:`, error);
      throw error;
    }
  },
  
  // Complete a campaign
  completeCampaign: async (campaignId) => {
    try {
      const response = await vaccinationApiClient.post(`/nurse/vaccination-campaigns/${campaignId}/complete`);
      return response.data;
    } catch (error) {
      console.error(`Error completing campaign ${campaignId}:`, error);
      throw error;
    }
  }
};

export default vaccinationCampaignApi; 