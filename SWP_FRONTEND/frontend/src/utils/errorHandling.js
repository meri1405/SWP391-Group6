/**
 * Utility functions for handling different types of errors
 * and redirecting to appropriate error pages
 */

// Error types supported by the error page
export const ERROR_TYPES = {
  OAUTH_LOGIN_FAILED: "oauth_login_failed",
  USER_NOT_FOUND: "user_not_found", 
  UNAUTHORIZED_ROLE: "unauthorized_role",
  SYSTEM_ERROR: "system_error",
  FIRST_TIME_LOGIN: "first_time_login",
  NETWORK_ERROR: "network_error",
  UNKNOWN: "unknown"
};

/**
 * Build error URL for redirecting to error page
 * @param {string} type - Error type from ERROR_TYPES
 * @param {string} message - Error message
 * @param {string} description - Optional detailed description
 * @returns {string} Complete URL for error page
 */
export const buildErrorUrl = (type, message, description = "") => {
  const params = new URLSearchParams();
  params.append("type", type);
  params.append("message", message);
  if (description) {
    params.append("description", description);
  }
  return `/error?${params.toString()}`;
};

/**
 * Navigate to error page programmatically
 * @param {function} navigate - React Router navigate function
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {string} description - Optional description
 */
export const navigateToError = (navigate, type, message, description = "") => {
  const errorUrl = buildErrorUrl(type, message, description);
  navigate(errorUrl, { replace: true });
};

/**
 * Handle OAuth2 errors specifically
 * @param {function} navigate - React Router navigate function
 * @param {string} errorMessage - Error message from OAuth2
 */
export const handleOAuth2Error = (navigate, errorMessage) => {
  let errorType = ERROR_TYPES.OAUTH_LOGIN_FAILED;
  let description = "";

  // Determine specific error type based on message
  if (errorMessage.includes("không tồn tại") || errorMessage.includes("not found")) {
    errorType = ERROR_TYPES.USER_NOT_FOUND;
    description = "Tài khoản email này chưa được đăng ký trong hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
  } else if (errorMessage.includes("không được phép") || errorMessage.includes("unauthorized")) {
    errorType = ERROR_TYPES.UNAUTHORIZED_ROLE;
    description = "Tài khoản của bạn không được phép sử dụng tính năng đăng nhập Google. Vui lòng sử dụng tên đăng nhập và mật khẩu.";
  } else if (errorMessage.includes("Lỗi hệ thống") || errorMessage.includes("system")) {
    errorType = ERROR_TYPES.SYSTEM_ERROR;
    description = "Đã xảy ra lỗi trong hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên nếu lỗi tiếp tục xảy ra.";
  }

  navigateToError(navigate, errorType, errorMessage, description);
};

/**
 * Handle network errors
 * @param {function} navigate - React Router navigate function
 * @param {Error} errorObj - Network error object
 */
export const handleNetworkError = (navigate, errorObj) => {
  const errorMessage = errorObj?.message || "Không thể kết nối đến máy chủ";
  const description = "Vui lòng kiểm tra kết nối internet và thử lại. Nếu vấn đề tiếp tục xảy ra, vui lòng liên hệ quản trị viên.";
  
  navigateToError(navigate, ERROR_TYPES.NETWORK_ERROR, errorMessage, description);
};

/**
 * Handle first-time login redirection
 * @param {function} navigate - React Router navigate function
 * @param {string} email - User email
 */
export const handleFirstTimeLoginRedirect = (navigate, email) => {
  const errorMessage = "Cần thiết lập tài khoản";
  const description = "Đây là lần đăng nhập đầu tiên của bạn. Bạn cần thiết lập mật khẩu trước khi có thể sử dụng hệ thống.";
  
  // Add email to URL for context
  const errorUrl = buildErrorUrl(ERROR_TYPES.FIRST_TIME_LOGIN, errorMessage, description) + `&email=${encodeURIComponent(email)}`;
  navigate(errorUrl, { replace: true });
};

export default {
  ERROR_TYPES,
  buildErrorUrl,
  navigateToError,
  handleOAuth2Error,
  handleNetworkError,
  handleFirstTimeLoginRedirect
};
