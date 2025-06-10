/**
 * API Configuration & Utilities
 */

// Determine if we should use proxy (development) or full URLs (production)
const useProxy = import.meta.env.DEV;

// Base URL from environment variables
export const API_BASE_URL = useProxy
  ? ""
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}${
      import.meta.env.VITE_API_AUTH_LOGIN || "/api/auth/login"
    }`,
    requestOtp: `${API_BASE_URL}${
      import.meta.env.VITE_API_AUTH_REQUEST_OTP || "/api/auth/parent/request-otp"
    }`,
    verifyOtp: `${API_BASE_URL}${
      import.meta.env.VITE_API_AUTH_VERIFY_OTP || "/api/auth/parent/verify-otp"
    }`,
    // Firebase endpoints
    firebaseConfig: `${API_BASE_URL}${
      import.meta.env.VITE_API_AUTH_FIREBASE_CONFIG || "/api/auth/firebase-config"
    }`,
    verifyFirebaseOtp: `${API_BASE_URL}${
      import.meta.env.VITE_API_AUTH_VERIFY_FIREBASE_OTP || "/api/auth/parent/verify-firebase-otp"
    }`,
    // OAuth2 endpoints
    googleOAuth: `${API_BASE_URL}${
      import.meta.env.VITE_API_OAUTH2_GOOGLE || "/oauth2/authorize/google"
    }`,
  },
  // Add other endpoint categories as needed
};

// Debug function to log CORS info in development
export const logCorsInfo = (url) => {
  if (import.meta.env.DEV) {
    console.log(`Making request to: ${url}`);
    console.log(`From origin: ${window.location.origin}`);
  }
};

// Helper function to check if in development mode
export const isDevelopment = import.meta.env.DEV;

/**
 * Generic API request function with error handling
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options (method, headers, body)
 * @returns {Promise} - Response data or error
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // Set default headers if not provided
    if (!options.headers) {
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token && !options.headers.Authorization) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    // Log CORS info in development
    if (isDevelopment) {
      logCorsInfo(endpoint);
    }

    // Make the request
    const response = await fetch(endpoint, options);

    // Handle response
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      return response.text();
    }

    // Handle error responses
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        return Promise.reject(errorData);
      } else {
        // If response is not JSON, create error object
        return Promise.reject({
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        });
      }
    } catch (parseError) {
      return Promise.reject({
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        originalError: parseError,
      });
    }
  } catch (error) {
    console.error("API request failed:", error);
    return Promise.reject({
      message: "Không thể kết nối đến server. Vui lòng thử lại.",
      originalError: error,
    });
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  apiRequest,
  isDevelopment,
};
