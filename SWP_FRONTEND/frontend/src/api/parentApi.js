import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with authorization header
const createAuthAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const parentApi = {
  // Get students associated with the authenticated parent
  getMyStudents: async (token) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get('/api/parent/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching parent students:', error);
      throw error;
    }
  },

  // Get parent profile details (if needed in the future)
  getParentProfile: async (token) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get('/api/parent/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      throw error;
    }
  },
  // Update parent profile (if needed in the future)
  updateParentProfile: async (token, profileData) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put('/api/parent/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating parent profile:', error);
      throw error;
    }
  },  // Get medication requests for parent's students
  getMedicationRequests: async (token) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log('Sending request to fetch medication requests');
      const response = await authAxios.get('/api/parent/medication-requests');
      console.log('Received medication request response:', response);
      
      // Check for proper data structure
      if (response.data === null) {
        console.warn('Medication data is null, returning empty array');
        return [];
      }
      
      // Ensure we handle both array and single object responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Handle case when API returns a single object or a wrapper object
        if (Array.isArray(response.data.content)) {
          return response.data.content;
        }
        // If it's a single object with an ID, wrap it in an array
        if (response.data.id) {
          return [response.data];
        }
      }
      
      // Default to empty array if we couldn't determine the structure
      console.warn('Unexpected response format, using empty array:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching medication requests:', error);
      
      // Add more detailed error reporting
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  },
  // Create a new medication request
  createMedicationRequest: async (token, medicationData) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log('Creating new medication request with data:', medicationData);
      const response = await authAxios.post('/api/parent/medication-requests', medicationData);
      console.log('Medication request creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating medication request:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
  // Update an existing medication request
  updateMedicationRequest: async (token, requestId, medicationData) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log('Updating medication request with ID:', requestId, 'and data:', medicationData);
      
      // Validate required fields
      if (!requestId) {
        throw new Error('Request ID is required for updating medication request');
      }
      
      if (!medicationData.studentId) {
        throw new Error('Student ID is required');
      }
      
      if (!medicationData.itemRequests || medicationData.itemRequests.length === 0) {
        throw new Error('At least one medication item is required');
      }
      
      const response = await authAxios.put(`/api/parent/medication-requests/${requestId}`, medicationData);
      console.log('Medication request update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating medication request:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Handle specific error cases
        if (error.response.status === 403) {
          throw new Error('Bạn không có quyền cập nhật yêu cầu thuốc này');
        } else if (error.response.status === 404) {
          throw new Error('Không tìm thấy yêu cầu thuốc');
        } else if (error.response.status === 400) {
          throw new Error('Chỉ có thể cập nhật yêu cầu thuốc đang chờ duyệt');
        }
      }
      
      throw error;
    }
  },

  // Delete a medication request
  deleteMedicationRequest: async (token, requestId) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log('Deleting medication request with ID:', requestId);
      
      // Validate required fields
      if (!requestId) {
        throw new Error('Request ID is required for deleting medication request');
      }
      
      const response = await authAxios.delete(`/api/parent/medication-requests/${requestId}`);
      console.log('Medication request deletion response:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error deleting medication request:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Handle specific error cases
        if (error.response.status === 403) {
          throw new Error('Bạn không có quyền xóa yêu cầu thuốc này');
        } else if (error.response.status === 404) {
          throw new Error('Không tìm thấy yêu cầu thuốc');
        } else if (error.response.status === 400) {
          throw new Error('Chỉ có thể xóa yêu cầu thuốc đang chờ duyệt');
        }
      }
      
      throw error;
    }
  },

  // Get detailed medication request by ID
  getMedicationRequestDetails: async (token, requestId) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log('Fetching medication request details for ID:', requestId);
      const response = await authAxios.get(`/api/parent/medication-requests/${requestId}`);
      console.log('Received medication request details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication request details:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }
};
