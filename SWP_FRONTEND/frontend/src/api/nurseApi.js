import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Get token from localStorage or context
const getStoredToken = () => {
  return localStorage.getItem('token');
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Create axios instance with authentication
const createAuthAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const nurseApi = {
  // Medication Requests Management
  getPendingMedicationRequests: async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Fetching pending medication requests');
      const response = await authAxios.get('/api/nurse/medications/requests/pending');
      console.log('Received pending medication requests:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending medication requests:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  approveMedicationRequest: async (requestId) => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Approving medication request with ID:', requestId);
      const response = await authAxios.put(`/api/nurse/medications/requests/${requestId}/approve`);
      console.log('Medication request approved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error approving medication request:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  rejectMedicationRequest: async (requestId, note) => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Rejecting medication request with ID:', requestId, 'note:', note);
      const response = await authAxios.put(`/api/nurse/medications/requests/${requestId}/reject`, {
        note: note
      });
      console.log('Medication request rejected:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting medication request:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Medication Schedules Management
  getSchedulesByDate: async (params) => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Fetching schedules for params:', params);
      
      let url = '/api/nurse/medications/schedules';
      const queryParams = new URLSearchParams();
      
      if (params.date) {
        queryParams.append('date', params.date);
      }
      if (params.status) {
        queryParams.append('status', params.status);
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      console.log('Final URL:', url);
      const response = await authAxios.get(url);
      console.log('Received medication schedules:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication schedules:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  getSchedulesForStudent: async (studentId) => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Fetching schedules for student ID:', studentId);
      const response = await authAxios.get(`/api/nurse/medications/schedules/student/${studentId}`);
      console.log('Received student medication schedules:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student medication schedules:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
  updateScheduleStatus: async (scheduleId, status, note = '') => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Updating schedule status:', { scheduleId, status, note });
      const response = await authAxios.put(`/api/nurse/medications/schedules/${scheduleId}/status`, {
        status: status,
        note: note
      });
      console.log('Schedule status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule status:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
  updateScheduleNote: async (scheduleId, note) => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        throw new Error('Token has expired');
      }
      
      const authAxios = createAuthAxios(token);
      console.log('Updating schedule note:', { scheduleId, note });
      const response = await authAxios.put(`/api/nurse/medications/schedules/${scheduleId}/note`, {
        note: note
      });
      console.log('Schedule note updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule note:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }
};
