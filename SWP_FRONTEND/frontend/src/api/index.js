// ==================== API EXPORTS ====================
// Centralized API exports for easier imports across the application

// Admin APIs
export * from "./adminApi";

// Parent APIs
export * from "./parentApi";

// Nurse APIs
export * from "./nurseApi";

// Vaccination APIs
export * from "./vaccinationCampaignApi";

// Medical Event APIs
export * from "./medicalEventApi";

// Medical Supply APIs
export * from "./medicalSupplyApi";

// Restock Request APIs
export * from "./restockRequestApi";

// User APIs
export * from "./userApi";

// Health Check APIs
export * from './healthCheckApi';

// ==================== LEGACY SUPPORT ====================
// Provide legacy imports to ensure backward compatibility

// Re-export admin functions for legacy code
export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getAdminProfile,
  updateAdminProfile,
} from "./adminApi";

// ==================== API CONFIGURATION ====================
export const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// ==================== COMMON UTILITIES ====================
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const handleApiError = (error, defaultMessage = "An error occurred") => {
  console.error("API Error:", error);

  if (error.message) {
    return error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return defaultMessage;
};

export const apiRequest = async (url, options = {}) => {
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
};
