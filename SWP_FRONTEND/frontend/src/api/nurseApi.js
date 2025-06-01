import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

// Get fresh token from localStorage and verify it's not expired
const getStoredToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.error('Token is expired');
    // Clear expired token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTimestamp');
    return null;
  }
  
  // Update session timestamp to keep the session alive
  localStorage.setItem("loginTimestamp", Date.now().toString());
  return token;
};

// Create axios instance with authentication and token refresh
const createAuthAxios = (token) => {
  if (!token) {
    console.error('No valid token provided to createAuthAxios');
    throw new Error('Authentication required');
  }
  
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Add response interceptor for token expiration
  instance.interceptors.response.use(
    (response) => response, 
    async (error) => {
      const originalRequest = error.config;
      
      // If we get a 401 error and haven't tried refreshing already
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('Received 401, checking if token needs refresh');
        originalRequest._retry = true;
        
        // Try to get a fresh token
        localStorage.setItem("loginTimestamp", Date.now().toString());
        const freshToken = getStoredToken();
        
        if (freshToken) {
          // If we got a fresh token, try the request again
          console.log('Got fresh token, retrying request');
          originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
          return axios(originalRequest);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
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
  },  updateScheduleNote: async (scheduleId, note) => {
    try {
      // Get a fresh token from storage and ensure it's valid
      const token = getStoredToken();
      if (!token) {
        console.error('Authentication token not found or expired');
        throw new Error('No authentication token found');
      }
      
      // Create authenticated axios instance with interceptors
      const authAxios = createAuthAxios(token);
      
      console.log('Updating schedule note:', { scheduleId, note });
      
      // Include retry logic directly in the function
      try {
        // Try the API call
        const response = await authAxios.put(`/api/nurse/medications/schedules/${scheduleId}/note`, {
          note: note
        });
        
        console.log('Schedule note updated successfully:', response.data);
        return response.data;
      } catch (apiError) {
        // If it's a 401 error, try one more time with a fresh token
        if (apiError.response?.status === 401) {
          console.log('Got 401 on note update, refreshing token and retrying...');
          
          // Update the timestamp and get a fresh token
          localStorage.setItem("loginTimestamp", Date.now().toString());
          const refreshedToken = getStoredToken();
          
          if (!refreshedToken) {
            throw new Error('Could not refresh authentication token');
          }
          
          // Create new axios instance with fresh token
          const refreshedAxios = axios.create({
            baseURL: API_BASE_URL,
            headers: {
              'Authorization': `Bearer ${refreshedToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          // Retry the API call with fresh token
          const retryResponse = await refreshedAxios.put(`/api/nurse/medications/schedules/${scheduleId}/note`, {
            note: note
          });
          
          console.log('Schedule note updated successfully on retry:', retryResponse.data);
          return retryResponse.data;
        }
        
        // If it's not a 401 or retry failed, throw the error
        throw apiError;
      }
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
