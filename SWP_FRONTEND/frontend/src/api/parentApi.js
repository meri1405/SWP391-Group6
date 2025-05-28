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
  }
};
