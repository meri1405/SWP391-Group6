import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Create axios instance with authorization header
const createAuthAxios = (token) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
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

      return Promise.reject(error);
    }
  );

  return instance;
};

// Helper to get token from localStorage with fallback
const getTokenFromStorage = () => {
  return localStorage.getItem("token");
};

export const parentApi = {
  // Get students associated with the authenticated parent
  getMyStudents: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/parent/students");
      return response.data;
    } catch (error) {
      console.error("Error fetching parent students:", error);
      throw error;
    }
  },

  // Get medication schedules for a specific child
  getChildMedicationSchedules: async (
    studentId,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/parent/students/${studentId}/medication-schedules`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching child medication schedules:", error);
      throw error;
    }
  },

  // Get medication schedules for all children with optional filters
  getAllChildrenMedicationSchedules: async (
    params = {},
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/parent/medication-schedules", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all children medication schedules:", error);
      throw error;
    }
  },

  // Get parent profile details (if needed in the future)
  getParentProfile: async (token) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/parent/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching parent profile:", error);
      throw error;
    }
  },
  // Update parent profile (if needed in the future)
  updateParentProfile: async (token, profileData) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put("/api/parent/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating parent profile:", error);
      throw error;
    }
  },

  // Health Profile endpoints
  createHealthProfile: async (
    healthProfileData,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        "/api/parent/health-profiles",
        healthProfileData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating health profile:", error);
      throw error;
    }
  },

  getHealthProfile: async (profileId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/parent/health-profiles/${profileId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health profile:", error);
      throw error;
    }
  },

  updateHealthProfile: async (
    profileId,
    healthProfileData,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/parent/health-profiles/${profileId}`,
        healthProfileData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating health profile:", error);
      throw error;
    }
  },

  getHealthProfilesByStudentId: async (
    studentId,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/parent/students/${studentId}/health-profiles`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health profiles by student ID:", error);
      throw error;
    }
  },

  deleteHealthProfile: async (profileId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.delete(
        `/api/parent/health-profiles/${profileId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting health profile:", error);
      throw error;
    }
  },

  // Get medication requests for parent's students
  getMedicationRequests: async (token) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log("Sending request to fetch medication requests");
      const response = await authAxios.get("/api/parent/medication-requests");
      console.log("Received medication request response:", response);

      // Check for proper data structure
      if (response.data === null) {
        console.warn("Medication data is null, returning empty array");
        return [];
      }

      // Ensure we handle both array and single object responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === "object") {
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
      console.warn(
        "Unexpected response format, using empty array:",
        response.data
      );
      return [];
    } catch (error) {
      console.error("Error fetching medication requests:", error);

      // Add more detailed error reporting
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

      throw error;
    }
  },
  // Create a new medication request
  createMedicationRequest: async (token, medicationData) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log("Creating new medication request with data:", medicationData);
      const response = await authAxios.post(
        "/api/parent/medication-requests",
        medicationData
      );
      console.log("Medication request creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating medication request:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  },
  // Update an existing medication request
  updateMedicationRequest: async (token, requestId, medicationData) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log(
        "Updating medication request with ID:",
        requestId,
        "and data:",
        medicationData
      );

      // Validate required fields
      if (!requestId) {
        throw new Error(
          "Request ID is required for updating medication request"
        );
      }

      if (!medicationData.studentId) {
        throw new Error("Student ID is required");
      }

      if (
        !medicationData.itemRequests ||
        medicationData.itemRequests.length === 0
      ) {
        throw new Error("At least one medication item is required");
      }

      const response = await authAxios.put(
        `/api/parent/medication-requests/${requestId}`,
        medicationData
      );
      console.log("Medication request update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating medication request:", error);

      // Enhanced error handling
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);

        // Handle specific error cases
        if (error.response.status === 403) {
          throw new Error("Bạn không có quyền cập nhật yêu cầu thuốc này");
        } else if (error.response.status === 404) {
          throw new Error("Không tìm thấy yêu cầu thuốc");
        } else if (error.response.status === 400) {
          throw new Error("Chỉ có thể cập nhật yêu cầu thuốc đang chờ duyệt");
        }
      }

      throw error;
    }
  },

  // Delete a medication request
  deleteMedicationRequest: async (token, requestId) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log("Deleting medication request with ID:", requestId);

      // Validate required fields
      if (!requestId) {
        throw new Error(
          "Request ID is required for deleting medication request"
        );
      }

      const response = await authAxios.delete(
        `/api/parent/medication-requests/${requestId}`
      );
      console.log("Medication request deletion response:", response.status);
      return response.data;
    } catch (error) {
      console.error("Error deleting medication request:", error);

      // Enhanced error handling
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);

        // Handle specific error cases
        if (error.response.status === 403) {
          throw new Error("Bạn không có quyền xóa yêu cầu thuốc này");
        } else if (error.response.status === 404) {
          throw new Error("Không tìm thấy yêu cầu thuốc");
        } else if (error.response.status === 400) {
          throw new Error("Chỉ có thể xóa yêu cầu thuốc đang chờ duyệt");
        }
      }

      throw error;
    }
  },

  // Get detailed medication request by ID
  getMedicationRequestDetails: async (token, requestId) => {
    try {
      const authAxios = createAuthAxios(token);
      console.log("Fetching medication request details for ID:", requestId);
      const response = await authAxios.get(
        `/api/parent/medication-requests/${requestId}`
      );
      console.log("Received medication request details:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching medication request details:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  },

  // Get approved health profiles for student
  getApprovedHealthProfiles: async (studentId, token) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/parent/students/${studentId}/health-profiles/approved`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching approved health profiles:", error);

      // Mock approved profiles for development
      return [
        {
          id: 1,
          weight: 45.5,
          height: 160.0,
          note: "Học sinh khỏe mạnh",
          status: "APPROVED",
          nurseNote: "Hồ sơ đã được kiểm tra và duyệt",
          schoolNurseFullName: "Nguyễn Thị Mai",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-20T14:20:00Z",
          allergies: [
            {
              id: 1,
              allergen: "Phấn hoa",
              severity: "MILD",
              symptoms: "Hắt hơi, chảy nước mũ",
              onsetDate: "2023-03-15",
            },
          ],
          chronicDiseases: [],
          infectiousDiseases: [],
          treatments: [],
          vaccinationHistory: [],
          vision: [],
          hearing: [],
        },
      ];
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
      console.error("Error fetching all notifications:", error);
      throw error;
    }
  },

  getUnreadNotifications: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/notifications/unread");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  },

  getUnreadNotificationCount: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/notifications/unread/count");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
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
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Vaccination Form APIs
  getVaccinationForms: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/parent/vaccination-forms");
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination forms:", error);
      throw error;
    }
  },

  getPendingVaccinationForms: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/parent/vaccination-forms/pending"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending vaccination forms:", error);
      throw error;
    }
  },

  getVaccinationFormById: async (formId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/parent/vaccination-forms/${formId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination form:", error);
      throw error;
    }
  },

  confirmVaccinationForm: async (
    formId,
    notes = "",
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/parent/vaccination-forms/${formId}/confirm`,
        {
          notes: notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming vaccination form:", error);
      throw error;
    }
  },

  declineVaccinationForm: async (
    formId,
    notes = "",
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.post(
        `/api/parent/vaccination-forms/${formId}/decline`,
        {
          notes: notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error declining vaccination form:", error);
      throw error;
    }
  },

  getVaccinationStatistics: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/parent/vaccination-forms/statistics"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination statistics:", error);
      throw error;
    }
  },

  // Health Check Form APIs
  getHealthCheckForms: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get("/api/health-check/forms/parent");
      return response.data;
    } catch (error) {
      console.error("Error fetching health check forms:", error);
      throw error;
    }
  },

  getHealthCheckFormsByStatus: async (
    status,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/health-check/forms/parent/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health check forms by status:", error);
      throw error;
    }
  },

  getPendingHealthCheckForms: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/health-check/forms/parent/status/PENDING"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending health check forms:", error);
      throw error;
    }
  },

  getHealthCheckFormById: async (formId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(`/api/health-check/forms/${formId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching health check form:", error);
      throw error;
    }
  },

  confirmHealthCheckForm: async (
    formId,
    notes = "",
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/health-check/forms/${formId}/confirm?parentNote=${encodeURIComponent(
          notes
        )}`
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming health check form:", error);
      throw error;
    }
  },

  declineHealthCheckForm: async (
    formId,
    notes = "",
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/health-check/forms/${formId}/decline?parentNote=${encodeURIComponent(
          notes
        )}`
      );
      return response.data;
    } catch (error) {
      console.error("Error declining health check form:", error);
      throw error;
    }
  },

  getHealthCheckStatistics: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      // This endpoint might not exist, so we'll provide a fallback
      const response = await authAxios.get("/api/health-check/forms/parent");
      const forms = response.data;

      // Calculate statistics from the forms
      const confirmed = forms.filter(
        (form) => form.status === "CONFIRMED"
      ).length;
      const pending = forms.filter((form) => form.status === "PENDING").length;
      const declined = forms.filter(
        (form) => form.status === "DECLINED"
      ).length;

      return {
        confirmed,
        pending,
        declined,
        total: forms.length,
      };
    } catch (error) {
      console.error("Error fetching health check statistics:", error);
      throw error;
    }
  },

  // Get health check campaign details by form ID
  getHealthCheckCampaignByFormId: async (
    formId,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/health-check/campaigns/parent/form/${formId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health check campaign details:", error);
      throw error;
    }
  },

  // Get detailed health check form information for parent modal
  getHealthCheckFormDetails: async (formId, token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        `/api/health-check/forms/${formId}/details`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health check form details:", error);
      throw error;
    }
  },

  // Get active health check campaigns for parent
  getActiveHealthCheckCampaigns: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/health-check/campaigns/parent/active"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active health check campaigns:", error);
      throw error;
    }
  },

  // Get students with their health profile status
  getStudentsWithHealthProfileStatus: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/parent/students/health-profile-status"
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching students with health profile status:",
        error
      );
      throw error;
    }
  },

  // Check if any students are missing health profiles
  getStudentsMissingHealthProfiles: async (token = getTokenFromStorage()) => {
    try {
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(
        "/api/parent/students/missing-health-profiles"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching students missing health profiles:", error);
      throw error;
    }
  },

  // Auto-generate health check form when none exists
  autoGenerateHealthCheckForm: async (
    campaignId = null,
    studentId = null,
    token = getTokenFromStorage()
  ) => {
    try {
      const authAxios = createAuthAxios(token);
      const params = new URLSearchParams();
      if (campaignId) params.append("campaignId", campaignId);
      if (studentId) params.append("studentId", studentId);

      const response = await authAxios.post(
        `/api/health-check/forms/auto-generate?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error auto-generating health check form:", error);
      throw error;
    }
  },
};
