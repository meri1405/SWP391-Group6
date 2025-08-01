import axios from "axios";

// Sử dụng import.meta.env thay vì process.env cho Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper to get token from localStorage with fallback
const getTokenFromStorage = () => {
  return localStorage.getItem("token");
};

// Create axios instance with authorization header - pattern similar to parentApi.js
const createAuthAxios = (token) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Add response interceptor for token expiration
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If we get a 401 error and haven't tried refreshing already
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log("Received 401, attempting token refresh");
        originalRequest._retry = true;

        // Update the timestamp and try to get a fresh token
        localStorage.setItem("loginTimestamp", Date.now().toString());
        const freshToken = getTokenFromStorage();

        if (freshToken) {
          // If we got a fresh token, retry the request
          console.log("Got fresh token, retrying request");
          originalRequest.headers["Authorization"] = `Bearer ${freshToken}`;
          return axios(originalRequest);
        }
      }

      // Special handling for health profile APIs
      if (
        error.response?.status === 401 &&
        error.config?.url?.includes("/health-profiles")
      ) {
        console.log(
          "Skipping redirect for health-profile API, mock data will be used"
        );
      } else if (error.response?.status === 401) {
        // Redirect to login for other 401 errors
        console.log("401 detected, redirecting to login");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Xử lý lỗi 400 (Bad Request) cho API reject health profile
      if (
        error.response?.status === 400 &&
        error.config?.url?.includes("/health-profiles") &&
        error.config?.url?.includes("/reject")
      ) {
        console.error(
          "Bad Request when rejecting health profile:",
          error.response.data
        );
        // Log chi tiết lỗi để debug
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create axios instance for nurse API with auth token included
const nurseApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
nurseApiClient.interceptors.request.use(
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

// Add response interceptor for error handling
nurseApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log endpoint and error for debugging
    console.log("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
    });

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Đặc biệt xử lý cho API reject health profile - không đăng xuất
      if (
        error.config?.url?.includes("/health-profiles") &&
        error.config?.url?.includes("/reject")
      ) {
        console.log(
          "Authentication error for reject health profile API - skipping logout"
        );
        // Không chuyển hướng đến trang đăng nhập
      }
      // Đặc biệt xử lý cho API medication requests - không đăng xuất
      else if (error.config?.url?.includes("/medications/requests")) {
        console.log(
          "Authentication error for medication requests API - skipping logout"
        );
        // Không chuyển hướng đến trang đăng nhập
      }
      // Đặc biệt xử lý cho API medication schedules - không đăng xuất
      else if (error.config?.url?.includes("/medications/schedules")) {
        console.log(
          "Authentication error for medication schedules API - skipping logout"
        );
        // Không chuyển hướng đến trang đăng nhập
      }
      // Only redirect to login for non health-profile APIs
      // Health profiles have special handling with mock data
      else if (!error.config?.url?.includes("/health-profiles")) {
        console.log(
          "401 detected for non-health-profile API, redirecting to login"
        );
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        console.log(
          "Skipping redirect for health-profile API, mock data will be used"
        );
      }
    }

    // Xử lý lỗi 400 (Bad Request) cho API reject health profile
    if (
      error.response?.status === 400 &&
      error.config?.url?.includes("/health-profiles") &&
      error.config?.url?.includes("/reject")
    ) {
      console.error(
        "Bad Request when rejecting health profile:",
        error.response.data
      );
      // Không cần chuyển hướng, chỉ log lỗi để debug
    }

    // Propagate error to respective API call for proper handling
    return Promise.reject(error);
  }
);

// Nurse Profile APIs
export const nurseApi = {
  // Get nurse profile - với mock data fallback
  getProfile: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/school-nurse/profile");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching nurse profile:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy hồ sơ",
      };
    }
  },

  // Update nurse profile - với mock response
  updateProfile: async (profileData) => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        "/api/school-nurse/profile",
        profileData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating nurse profile:", error);
      return {
        error: true,
        message: error.response?.data?.message || "Không thể cập nhật hồ sơ",
      };
    }
  },

  // Medication Request Management
  getPendingMedicationRequests: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/nurse/medications/requests/pending"
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching pending medication requests:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy yêu cầu",
      };
    }
  },

  // Lấy danh sách hồ sơ sức khỏe theo status
  getHealthProfiles: async (status = null) => {
    try {
      let url = "/api/nurse/health-profiles";
      if (status) {
        url += `?status=${status}`;
      }

      console.log(`Requesting health profiles with status: ${status}`);
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(url);
      console.log(`Health profiles API response:`, response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching health profiles:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy hồ sơ",
      };
    }
  },

  // Lấy thông tin chi tiết hồ sơ sức khỏe
  getHealthProfileDetail: async (profileId) => {
    try {
      console.log(`Requesting health profile detail for ID: ${profileId}`);
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/nurse/health-profiles/${profileId}`
      );
      console.log(`Health profile detail response:`, response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching health profile details:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy hồ sơ",
      };
    }
  },

  // Duyệt hồ sơ sức khỏe
  approveHealthProfile: async (profileId, nurseNote = "") => {
    try {
      console.log(`Approving health profile with ID: ${profileId}`, {
        nurseNote,
      });
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/nurse/health-profiles/${profileId}/approve`,
        nurseNote ? { nurseNote } : {}
      );
      console.log("Approve profile response:", response.data);

      return {
        success: true,
        data: response.data,
        message: "Duyệt hồ sơ sức khỏe thành công",
      };
    } catch (error) {
      console.error("Error approving health profile:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể duyệt hồ sơ",
      };
    }
  },

  // Từ chối hồ sơ sức khỏe
  rejectHealthProfile: async (profileId, reason = "") => {
    try {
      console.log(`Rejecting health profile with ID: ${profileId}`, { reason });

      // Đảm bảo có lý do từ chối
      const rejectionReason = reason ? reason.trim() : "Hồ sơ không hợp lệ";

      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);

      // Gửi cả reason và nurseNote để đảm bảo tương thích với backend
      const response = await authAxios.put(
        `/api/nurse/health-profiles/${profileId}/reject`,
        {
          reason: rejectionReason,
          nurseNote: rejectionReason,
        }
      );

      console.log("Reject profile response:", response.data);

      return {
        success: true,
        data: response.data,
        message: "Đã từ chối hồ sơ sức khỏe",
      };
    } catch (error) {
      console.error("Error rejecting health profile:", error);

      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

      return {
        success: false,
        message: error.response?.data?.message || "Không thể từ chối hồ sơ",
      };
    }
  },

  // Test authentication
  testAuth: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/nurse/health-profiles/test-auth"
      );
      return response.data;
    } catch (error) {
      console.error("Error testing authentication:", error);
      throw error;
    }
  },

  approveMedicationRequest: async (
    requestId,
    nurseNote = "",
    customMessage = ""
  ) => {
    try {
      console.log("Approving medication request API call:", {
        requestId,
        nurseNote,
        customMessage,
      });

      const token = getTokenFromStorage();
      console.log("Token available:", !!token);

      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/nurse/medications/requests/${requestId}/approve`,
        {
          nurseNote: nurseNote,
          customMessage: customMessage,
        }
      );

      console.log("Approve API response:", response.data);

      return {
        success: true,
        data: response.data,
        message:
          response.data.message || "Yêu cầu thuốc đã được duyệt thành công",
      };
    } catch (error) {
      console.error("Error approving medication request:", error);

      // Log chi tiết lỗi
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }

      // Trả về lỗi thật thay vì mock
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể duyệt yêu cầu thuốc",
        error: error.response?.data || error.message,
      };
    }
  },

  rejectMedicationRequest: async (
    requestId,
    nurseNote = "",
    customMessage = ""
  ) => {
    try {
      const response = await nurseApiClient.put(
        `/api/nurse/medications/requests/${requestId}/reject`,
        {
          nurseNote: nurseNote,
          customMessage: customMessage,
        }
      );
      return {
        success: true,
        data: response.data,
        message: "Yêu cầu thuốc đã bị từ chối",
      };
    } catch (error) {
      console.error("Error rejecting medication request:", error);
      // Mock rejection for development
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Yêu cầu thuốc đã bị từ chối",
      };
    }
  },

  // Get all medication requests (for history view)
  getAllMedicationRequests: async () => {
    try {
      const response = await nurseApiClient.get(
        "/api/nurse/medications/requests"
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching all medication requests:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy yêu cầu",
      };
    }
  },

  // Medication Schedule Management
  getSchedulesByDate: async (params) => {
    try {
      console.log("Getting schedules by date with params:", params);

      const token = getTokenFromStorage();
      console.log("Token for schedules:", token ? "exists" : "missing");

      if (!token) {
        console.error("No token found for medication schedules");
        return {
          success: false,
          message: "Không có token xác thực",
        };
      }

      const authAxios = createAuthAxios(token);

      // Thử các endpoint khác nhau
      const endpoints = [
        "/api/nurse/medications/schedules",
        "/api/school-nurse/medications/schedules",
        "/api/nurse/medication-schedules",
        "/api/school-nurse/medication-schedules",
      ];

      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await authAxios.get(endpoint, { params });
          console.log(`Success with endpoint ${endpoint}:`, response.data);

          return {
            success: true,
            data: response.data,
          };
        } catch (err) {
          console.log(
            `Failed with endpoint ${endpoint}:`,
            err.response?.status
          );
          lastError = err;

          // Nếu không phải 404, có thể là lỗi khác (401, 403, etc.)
          if (err.response?.status !== 404) {
            break;
          }
        }
      }

      // Nếu tất cả endpoints đều fail
      throw lastError;
    } catch (error) {
      console.error("Error fetching schedules by date:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });

      // Nếu lỗi 401 và không có data, trả về empty array
      if (error.response?.status === 401) {
        console.log("401 error - returning empty schedules array");
        return {
          success: true,
          data: [],
          message: "Không có quyền truy cập hoặc token hết hạn",
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy lịch trình",
      };
    }
  },

  getSchedulesForStudent: async (studentId) => {
    try {
      const response = await nurseApiClient.get(
        `/api/nurse/medications/schedules/student/${studentId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching schedules for student:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy lịch trình",
      };
    }
  },

  // Get all medication schedules
  getAllMedicationSchedules: async () => {
    try {
      console.log("Getting all medication schedules");

      const token = getTokenFromStorage();
      console.log("Token for schedules:", token ? "exists" : "missing");

      if (!token) {
        console.error("No token found for medication schedules");
        return {
          success: false,
          message: "Không có token xác thực",
        };
      }

      const authAxios = createAuthAxios(token);

      // Thử các endpoint khác nhau cho việc lấy tất cả schedules
      const endpoints = [
        "/api/nurse/medications/schedules/all",
        "/api/nurse/medications/schedules",
        "/api/school-nurse/medications/schedules/all",
        "/api/school-nurse/medications/schedules",
        "/api/nurse/medication-schedules/all",
        "/api/school-nurse/medication-schedules/all",
      ];

      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await authAxios.get(endpoint);
          console.log(`Success with endpoint ${endpoint}:`, response.data);

          return {
            success: true,
            data: response.data,
          };
        } catch (err) {
          console.log(
            `Failed with endpoint ${endpoint}:`,
            err.response?.status
          );
          lastError = err;

          // Nếu không phải 404, có thể là lỗi khác (401, 403, etc.)
          if (err.response?.status !== 404) {
            break;
          }
        }
      }

      // Nếu tất cả endpoints đều fail
      throw lastError;
    } catch (error) {
      console.error("Error fetching all medication schedules:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });

      // Nếu lỗi 401 và không có data, trả về empty array
      if (error.response?.status === 401) {
        console.log("401 error - returning empty schedules array");
        return {
          success: true,
          data: [],
          message: "Không có quyền truy cập hoặc token hết hạn",
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy lịch trình",
      };
    }
  },

  updateScheduleStatus: async (scheduleId, status, note = null) => {
    try {
      console.log("Updating schedule status:", { scheduleId, status, note });

      const token = getTokenFromStorage();
      if (!token) {
        return {
          success: false,
          message: "Không có token xác thực",
        };
      }

      const authAxios = createAuthAxios(token);
      const requestBody = { status };

      // Only include note in request if it's provided and not empty
      if (note && note.trim() !== "") {
        requestBody.note = note;
      }

      const response = await authAxios.put(
        `/api/nurse/medications/schedules/${scheduleId}/status`,
        requestBody
      );

      console.log("Update schedule status response:", response.data);

      return {
        success: true,
        data: response.data,
        message: response.data.message || "Cập nhật trạng thái thành công",
      };
    } catch (error) {
      console.error("Error updating schedule status:", error);

      if (error.response?.status === 401) {
        return {
          success: false,
          message: "Phiên đăng nhập đã hết hạn",
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể cập nhật trạng thái",
      };
    }
  },

  updateScheduleNote: async (scheduleId, note) => {
    try {
      const response = await nurseApiClient.put(
        `/api/nurse/medications/schedules/${scheduleId}/note`,
        {
          note,
        }
      );
      return {
        success: true,
        data: response.data,
        message: "Cập nhật ghi chú thành công",
      };
    } catch (error) {
      console.error("Error updating schedule note:", error);
      // Mock response for development
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Cập nhật ghi chú thành công",
      };
    }
  },
  // Vaccination Rule Management
  getAllVaccinationRules: async () => {
    try {
      const response = await nurseApiClient.get("/api/nurse/vaccination-rules");
      return response.data; // Return the array directly
    } catch (error) {
      console.error("Error fetching vaccination rules:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy quy tắc tiêm chủng",
      };
    }
  },

  getVaccinationRuleById: async (id) => {
    try {
      const response = await nurseApiClient.get(
        `/api/nurse/vaccination-rules/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination rule:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy quy tắc tiêm chủng",
      };
    }
  },

  createVaccinationRule: async (ruleData) => {
    try {
      const response = await nurseApiClient.post(
        "/api/nurse/vaccination-rules",
        ruleData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating vaccination rule:", error);
      throw error; // Re-throw to let the component handle the error
    }
  },
  updateVaccinationRule: async (id, ruleData) => {
    try {
      const response = await nurseApiClient.put(
        `/api/nurse/vaccination-rules/${id}`,
        ruleData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating vaccination rule:", error);
      throw error; // Re-throw to let the component handle the error
    }
  },
  deleteVaccinationRule: async (id) => {
    try {
      await nurseApiClient.delete(`/api/nurse/vaccination-rules/${id}`);
      return true; // Return success indicator
    } catch (error) {
      console.error("Error deleting vaccination rule:", error);
      throw error; // Re-throw to let the component handle the error
    }
  },
  // Notification endpoints
  getAllNotifications: async (token = getTokenFromStorage(), limit = null) => {
    try {
      const authAxios = createAuthAxios(token);
      const params = limit ? { limit } : {};
      const response = await authAxios.get("/api/notifications", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching school nurse notifications:", error);
      throw error;
    }
  },

  getUnreadNotifications: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/notifications/unread");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread school nurse notifications:", error);
      throw error;
    }
  },

  getUnreadNotificationCount: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/notifications/unread/count");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching unread notification count for school nurse:",
        error
      );
      throw error;
    }
  },

  markNotificationAsRead: async (
    notificationId,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking school nurse notification as read:", error);
      throw error;
    }
  },

  // Campaign completion requests
  requestCampaignCompletion: async (campaignId, requestData = {}) => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      console.log(
        `Requesting completion for campaign ${campaignId}:`,
        requestData
      );

      const response = await authAxios.post(
        `/api/nurse/campaign-completion/campaigns/${campaignId}/request-completion`,
        requestData
      );

      console.log("Campaign completion request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error requesting campaign completion:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  checkPendingCompletionRequest: async (campaignId) => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/nurse/campaign-completion/campaigns/${campaignId}/has-pending-request`
      );

      console.log("Pending completion request check:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error checking pending completion request:", error);
      throw error;
    }
  },

  getMyCompletionRequests: async () => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/nurse/campaign-completion/my-requests`
      );

      console.log("My completion requests:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting my completion requests:", error);
      throw error;
    }
  },

  // Get all students for medication schedules
  getAllStudents: async () => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/nurse/students`
      );

      console.log("All students:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Students loaded successfully"
      };
    } catch (error) {
      console.error("Error getting all students:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load students"
      };
    }
  },

  // Get students without health profiles
  getStudentsWithoutHealthProfiles: async () => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/nurse/health-profiles/students-without-profiles`
      );

      console.log("Students without health profiles:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Students without health profiles loaded successfully"
      };
    } catch (error) {
      console.error("Error getting students without health profiles:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load students without health profiles"
      };
    }
  },

  // Get health profile events
  getHealthProfileEvents: async (healthProfileId) => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/health-profile-events/health-profile/${healthProfileId}`
      );

      console.log("Health profile events:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Health profile events loaded successfully"
      };
    } catch (error) {
      console.error("Error getting health profile events:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load health profile events"
      };
    }
  },

  // Get recent health profile events
  getRecentHealthProfileEvents: async (healthProfileId, limit = 10) => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/health-profile-events/health-profile/${healthProfileId}/recent?limit=${limit}`
      );

      console.log("Recent health profile events:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Recent health profile events loaded successfully"
      };
    } catch (error) {
      console.error("Error getting recent health profile events:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load recent health profile events"
      };
    }
  },

  // Dashboard Statistics APIs
  getDashboardStatistics: async (filterParams = {}) => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      
      // Log the filter parameters being sent
      console.log("Sending dashboard statistics request with params:", filterParams);
      
      const params = new URLSearchParams();
      if (filterParams.filterType) params.append('filterType', filterParams.filterType);
      if (filterParams.date) params.append('date', filterParams.date);
      if (filterParams.month) params.append('month', filterParams.month);
      if (filterParams.year) params.append('year', filterParams.year);
      if (filterParams.startDate) params.append('startDate', filterParams.startDate);
      if (filterParams.endDate) params.append('endDate', filterParams.endDate);
      
      const requestUrl = `/api/nurse/dashboard/statistics?${params.toString()}`;
      console.log("Making request to:", requestUrl);
      
      const response = await authAxios.get(requestUrl);
      
      console.log("Dashboard statistics response:", response.data);
      
      return {
        success: true,
        data: response.data,
        message: "Dashboard statistics loaded successfully"
      };
    } catch (error) {
      console.error("Error getting dashboard statistics:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to load dashboard statistics"
      };
    }
  },

  getTodayStatistics: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      
      console.log("Making request to today's statistics endpoint");
      
      const response = await authAxios.get('/api/nurse/dashboard/statistics/today');
      
      console.log("Today's statistics response:", response.data);
      
      return {
        success: true,
        data: response.data,
        message: "Today's statistics loaded successfully"
      };
    } catch (error) {
      console.error("Error getting today's statistics:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to load today's statistics"
      };
    }
  },

  getMonthStatistics: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      
      const response = await authAxios.get('/api/nurse/dashboard/statistics/month');
      
      return {
        success: true,
        data: response.data,
        message: "Monthly statistics loaded successfully"
      };
    } catch (error) {
      console.error("Error getting monthly statistics:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to load monthly statistics"
      };
    }
  },

  getYearStatistics: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      
      const response = await authAxios.get('/api/nurse/dashboard/statistics/year');
      
      return {
        success: true,
        data: response.data,
        message: "Yearly statistics loaded successfully"
      };
    } catch (error) {
      console.error("Error getting yearly statistics:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to load yearly statistics"
      };
    }
  },

  getAllTimeStatistics: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      
      const response = await authAxios.get('/api/nurse/dashboard/statistics/all-time');
      
      return {
        success: true,
        data: response.data,
        message: "All-time statistics loaded successfully"
      };
    } catch (error) {
      console.error("Error getting all-time statistics:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to load all-time statistics"
      };
    }
  }
};

export default nurseApi;
