// ==================== HEALTH PROFILE EVENTS API ====================
// API functions for health profile audit trail management

// Direct API configuration to avoid circular imports
const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleApiError = (error, defaultMessage) => {
  if (error.message) {
    return error.message;
  }
  return defaultMessage || "Đã xảy ra lỗi";
};

const HEALTH_PROFILE_EVENT_API_BASE = `${API_CONFIG.BASE_URL}/health-profile-events`;

// ==================== HEALTH PROFILE EVENT OPERATIONS ====================

/**
 * Lấy danh sách sự kiện của một health profile
 * @param {number} healthProfileId - ID của health profile
 * @returns {Promise<Array>} Danh sách sự kiện
 */
export const getHealthProfileEvents = async (healthProfileId) => {
  try {
    const response = await fetch(`${HEALTH_PROFILE_EVENT_API_BASE}/health-profile/${healthProfileId}?_t=${Date.now()}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể lấy lịch sử thay đổi hồ sơ sức khỏe"));
  }
};

/**
 * Lấy sự kiện theo người dùng
 * @param {number} userId - ID của người dùng
 * @param {Object} options - Tùy chọn lọc
 * @param {string} [options.startDate] - Ngày bắt đầu (ISO string)
 * @param {string} [options.endDate] - Ngày kết thúc (ISO string)
 * @param {string} [options.actionType] - Loại hành động (CREATE, UPDATE, DELETE)
 * @returns {Promise<Array>} Danh sách sự kiện
 */
export const getEventsByUser = async (userId, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    
    if (options.startDate) {
      queryParams.append("startDate", options.startDate);
    }
    if (options.endDate) {
      queryParams.append("endDate", options.endDate);
    }
    if (options.actionType) {
      queryParams.append("actionType", options.actionType);
    }
    
    queryParams.append("_t", Date.now());

    const response = await fetch(`${HEALTH_PROFILE_EVENT_API_BASE}/user?${queryParams}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể lấy lịch sử hoạt động của người dùng"));
  }
};

/**
 * Lấy tất cả sự kiện health profile (chỉ dành cho quản lý)
 * @param {Object} filterOptions - Tùy chọn lọc
 * @param {number} [filterOptions.page] - Số trang (bắt đầu từ 0)
 * @param {number} [filterOptions.size] - Kích thước trang
 * @param {string} [filterOptions.startDate] - Ngày bắt đầu
 * @param {string} [filterOptions.endDate] - Ngày kết thúc
 * @param {string} [filterOptions.actionType] - Loại hành động
 * @param {number} [filterOptions.healthProfileId] - ID health profile cụ thể
 * @returns {Promise<Object>} Dữ liệu phân trang với danh sách sự kiện
 */
export const getAllHealthProfileEvents = async (filterOptions = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filterOptions.page !== undefined) {
      queryParams.append("page", filterOptions.page);
    }
    if (filterOptions.size) {
      queryParams.append("size", filterOptions.size);
    }
    if (filterOptions.startDate) {
      queryParams.append("startDate", filterOptions.startDate);
    }
    if (filterOptions.endDate) {
      queryParams.append("endDate", filterOptions.endDate);
    }
    if (filterOptions.actionType) {
      queryParams.append("actionType", filterOptions.actionType);
    }
    if (filterOptions.healthProfileId) {
      queryParams.append("healthProfileId", filterOptions.healthProfileId);
    }
    
    queryParams.append("_t", Date.now());

    const response = await fetch(`${HEALTH_PROFILE_EVENT_API_BASE}?${queryParams}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể lấy danh sách sự kiện hồ sơ sức khỏe"));
  }
};

/**
 * Lấy thống kê sự kiện health profile
 * @param {Object} options - Tùy chọn thống kê
 * @param {string} [options.startDate] - Ngày bắt đầu
 * @param {string} [options.endDate] - Ngày kết thúc
 * @param {string} [options.groupBy] - Nhóm theo (DATE, USER, ACTION_TYPE)
 * @returns {Promise<Object>} Dữ liệu thống kê
 */
export const getHealthProfileEventStatistics = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.startDate) {
      // Convert to ISO datetime format for backend
      const startDateTime = options.startDate + "T00:00:00";
      queryParams.append("startDate", startDateTime);
    }
    if (options.endDate) {
      // Convert to ISO datetime format for backend  
      const endDateTime = options.endDate + "T23:59:59";
      queryParams.append("endDate", endDateTime);
    }
    if (options.groupBy) {
      queryParams.append("groupBy", options.groupBy);
    }
    
    queryParams.append("_t", Date.now());

    const response = await fetch(`${HEALTH_PROFILE_EVENT_API_BASE}/statistics?${queryParams}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể lấy thống kê sự kiện"));
  }
};

// ==================== EVENT TYPES ====================

/**
 * Các loại hành động trong health profile events
 */
export const HEALTH_PROFILE_ACTION_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT'
};

/**
 * Nhãn hiển thị cho các loại hành động
 */
export const ACTION_TYPE_LABELS = {
  [HEALTH_PROFILE_ACTION_TYPES.CREATE]: 'Tạo mới',
  [HEALTH_PROFILE_ACTION_TYPES.UPDATE]: 'Cập nhật',
  [HEALTH_PROFILE_ACTION_TYPES.DELETE]: 'Xóa',
  [HEALTH_PROFILE_ACTION_TYPES.APPROVE]: 'Phê duyệt',
  [HEALTH_PROFILE_ACTION_TYPES.REJECT]: 'Từ chối'
};

/**
 * Màu sắc cho các loại hành động (dùng cho Tag)
 */
export const ACTION_TYPE_COLORS = {
  [HEALTH_PROFILE_ACTION_TYPES.CREATE]: 'green',
  [HEALTH_PROFILE_ACTION_TYPES.UPDATE]: 'blue',
  [HEALTH_PROFILE_ACTION_TYPES.DELETE]: 'red',
  [HEALTH_PROFILE_ACTION_TYPES.APPROVE]: 'success',
  [HEALTH_PROFILE_ACTION_TYPES.REJECT]: 'error'
};
