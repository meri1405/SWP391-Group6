import axios from "axios";
import { API_ENDPOINTS } from "../constants";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://swp391-group6.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Generic API methods
const apiService = {
  // GET request
  get: async (url, params = {}) => {
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST request
  post: async (url, data = {}) => {
    try {
      const response = await apiClient.post(url, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // PUT request
  put: async (url, data = {}) => {
    try {
      const response = await apiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // PATCH request
  patch: async (url, data = {}) => {
    try {
      const response = await apiClient.patch(url, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Auth API
export const authAPI = {
  login: (credentials) =>
    apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  logout: () => apiService.post(API_ENDPOINTS.AUTH.LOGOUT),
  requestOTP: (phoneNumber) =>
    apiService.post(API_ENDPOINTS.AUTH.OTP_REQUEST, { phoneNumber }),
  verifyOTP: (phoneNumber, otp) =>
    apiService.post(API_ENDPOINTS.AUTH.OTP_VERIFY, { phoneNumber, otp }),
  refreshToken: () => apiService.post(API_ENDPOINTS.AUTH.REFRESH),
};

// Admin API
export const adminAPI = {
  getProfile: () => apiService.get(API_ENDPOINTS.ADMIN.PROFILE),
  updateProfile: (data) => apiService.put(API_ENDPOINTS.ADMIN.PROFILE, data),
  getSettings: () => apiService.get(API_ENDPOINTS.ADMIN.SETTINGS),
  updateSettings: (data) => apiService.post(API_ENDPOINTS.ADMIN.SETTINGS, data),
  deleteUser: (userId) =>
    apiService.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`),
};

// Parent API
export const parentAPI = {
  getStudents: () => apiService.get(API_ENDPOINTS.PARENT.STUDENTS),
  getStudent: (studentId) =>
    apiService.get(`${API_ENDPOINTS.PARENT.STUDENTS}/${studentId}`),
  getHealthProfiles: () => apiService.get(API_ENDPOINTS.PARENT.HEALTH_PROFILES),
  getMissingProfiles: () =>
    apiService.get(API_ENDPOINTS.PARENT.MISSING_PROFILES),

  // Health Profile Management
  createHealthProfile: (data) =>
    apiService.post("/parent/health-profiles", data),
  updateHealthProfile: (id, data) =>
    apiService.put(`/parent/health-profiles/${id}`, data),
  deleteHealthProfile: (id) =>
    apiService.delete(`/parent/health-profiles/${id}`),

  // Medication Management
  getMedicationRequests: () => apiService.get("/parent/medication-requests"),
  createMedicationRequest: (data) =>
    apiService.post("/parent/medication-requests", data),
  updateMedicationRequest: (id, data) =>
    apiService.put(`/parent/medication-requests/${id}`, data),
  deleteMedicationRequest: (id) =>
    apiService.delete(`/parent/medication-requests/${id}`),

  // Vaccination Management
  getVaccinationHistory: (studentId) =>
    apiService.get(`/parent/students/${studentId}/vaccination-history`),
  addVaccinationRecord: (studentId, data) =>
    apiService.post(`/parent/students/${studentId}/vaccination-history`, data),
  updateVaccinationRecord: (recordId, data) =>
    apiService.put(`/parent/vaccination-history/${recordId}`, data),
  deleteVaccinationRecord: (recordId) =>
    apiService.delete(`/parent/vaccination-history/${recordId}`),
};

// Nurse API
export const nurseAPI = {
  getHealthChecks: () => apiService.get(API_ENDPOINTS.NURSE.HEALTH_CHECKS),
  getMedications: () => apiService.get(API_ENDPOINTS.NURSE.MEDICATIONS),

  // Health Check Management
  createHealthCheck: (data) => apiService.post("/nurse/health-checks", data),
  updateHealthCheck: (id, data) =>
    apiService.put(`/nurse/health-checks/${id}`, data),
  recordHealthCheckResult: (data) =>
    apiService.post("/nurse/health-check-results", data),

  // Medication Management
  getMedicationRequests: () => apiService.get("/nurse/medication-requests"),
  approveMedicationRequest: (id, data) =>
    apiService.put(`/nurse/medication-requests/${id}/approve`, data),
  rejectMedicationRequest: (id, data) =>
    apiService.put(`/nurse/medication-requests/${id}/reject`, data),

  // Medical Events
  getMedicalEvents: () => apiService.get("/nurse/medical-events"),
  createMedicalEvent: (data) => apiService.post("/nurse/medical-events", data),
  updateMedicalEvent: (id, data) =>
    apiService.put(`/nurse/medical-events/${id}`, data),

  // Student Management
  getStudents: () => apiService.get("/nurse/students"),
  getStudentProfile: (studentId) =>
    apiService.get(`/nurse/students/${studentId}`),
};

// Manager API
export const managerAPI = {
  getCampaigns: () => apiService.get(API_ENDPOINTS.MANAGER.CAMPAIGNS),
  getReports: () => apiService.get(API_ENDPOINTS.MANAGER.REPORTS),

  // Campaign Management
  createCampaign: (data) => apiService.post("/manager/campaigns", data),
  updateCampaign: (id, data) =>
    apiService.put(`/manager/campaigns/${id}`, data),
  deleteCampaign: (id) => apiService.delete(`/manager/campaigns/${id}`),

  // Vaccination Campaign
  getVaccinationCampaigns: () =>
    apiService.get("/manager/vaccination-campaigns"),
  createVaccinationCampaign: (data) =>
    apiService.post("/manager/vaccination-campaigns", data),
  updateVaccinationCampaign: (id, data) =>
    apiService.put(`/manager/vaccination-campaigns/${id}`, data),

  // Health Check Campaign
  getHealthCheckCampaigns: () =>
    apiService.get("/manager/health-check-campaigns"),
  createHealthCheckCampaign: (data) =>
    apiService.post("/manager/health-check-campaigns", data),
  updateHealthCheckCampaign: (id, data) =>
    apiService.put(`/manager/health-check-campaigns/${id}`, data),

  // Students Management
  getStudents: (params) => apiService.get("/manager/students", params),
  createStudent: (data) => apiService.post("/manager/students", data),
  updateStudent: (id, data) => apiService.put(`/manager/students/${id}`, data),
  deleteStudent: (id) => apiService.delete(`/manager/students/${id}`),
  importStudents: (data) => apiService.post("/manager/students/import", data),

  // Inventory Management
  getInventory: () => apiService.get("/manager/inventory"),
  updateInventory: (id, data) =>
    apiService.put(`/manager/inventory/${id}`, data),
  getRestockRequests: () => apiService.get("/manager/restock-requests"),
  approveRestockRequest: (id) =>
    apiService.put(`/manager/restock-requests/${id}/approve`),
  rejectRestockRequest: (id) =>
    apiService.put(`/manager/restock-requests/${id}/reject`),
};

// Common API
export const commonAPI = {
  // File Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiService.post("/common/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // System Settings
  getPublicSettings: () => apiService.get("/common/settings/public"),

  // Search
  searchStudents: (query) =>
    apiService.get(`/common/search/students?q=${query}`),
  searchUsers: (query) => apiService.get(`/common/search/users?q=${query}`),
};

export default apiService;
