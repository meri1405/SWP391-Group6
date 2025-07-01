import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with auth token
const healthCheckApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
healthCheckApiClient.interceptors.request.use(
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

const getTokenFromStorage = () => {
  return localStorage.getItem("token");
};

export const healthCheckApi = {
  getAllCampaigns: async () => {
    try {
      // Get campaigns from all available status endpoints
      const statuses = [
        "PENDING",
        "APPROVED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELED",
      ];
      const allCampaigns = [];

      // Fetch campaigns for each status
      for (const status of statuses) {
        try {
          const response = await healthCheckApiClient.get(
            `/health-check/campaigns/status/${status}`
          );
          if (Array.isArray(response.data)) {
            allCampaigns.push(...response.data);
          }
        } catch (statusError) {
          console.warn(
            `⚠️ Could not fetch campaigns for status ${status}:`,
            statusError.message
          );
          // Continue with other statuses
        }
      }

      // Also try to get upcoming and completed campaigns to ensure we have everything
      try {
        const upcomingResponse = await healthCheckApiClient.get(
          "/health-check/campaigns/upcoming"
        );
        if (Array.isArray(upcomingResponse.data)) {
          // Add only campaigns not already in the list
          const existingIds = new Set(allCampaigns.map((c) => c.id));
          const newCampaigns = upcomingResponse.data.filter(
            (c) => !existingIds.has(c.id)
          );
          allCampaigns.push(...newCampaigns);
        }
      } catch (upcomingError) {
        console.warn(
          "⚠️ Could not fetch upcoming campaigns:",
          upcomingError.message
        );
      }

      try {
        const completedResponse = await healthCheckApiClient.get(
          "/health-check/campaigns/completed"
        );
        if (Array.isArray(completedResponse.data)) {
          // Add only campaigns not already in the list
          const existingIds = new Set(allCampaigns.map((c) => c.id));
          const newCampaigns = completedResponse.data.filter(
            (c) => !existingIds.has(c.id)
          );
          allCampaigns.push(...newCampaigns);
        }
      } catch (completedError) {
        console.warn(
          "⚠️ Could not fetch completed campaigns:",
          completedError.message
        );
      }

      // Remove duplicates based on campaign ID
      const uniqueCampaigns = allCampaigns.filter(
        (campaign, index, self) =>
          index === self.findIndex((c) => c.id === campaign.id)
      );

      console.log(
        `✅ Successfully fetched ${uniqueCampaigns.length} total campaigns from all sources`
      );
      return uniqueCampaigns;
    } catch (error) {
      console.error("❌ Error fetching all health check campaigns:", error);
      throw error;
    }
  },

  // Get campaigns created by current nurse
  getNurseCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get(
        "/health-check/campaigns/nurse"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching nurse health check campaigns:", error);
      throw error;
    }
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {

      const response = await healthCheckApiClient.get(
        `/health-check/campaigns/${id}`
      );
      return response.data; 
      
    } catch (error) {
      console.error(`Error fetching health check campaign ${id}:`, error);
    }
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await healthCheckApiClient.post(
        "/health-check/campaigns",
        campaignData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating health check campaign:", error);
      throw error;
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await healthCheckApiClient.put(
        `/health-check/campaigns/${id}`,
        campaignData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating health check campaign ${id}:`, error);
      throw error;
    }
  },

  // Submit campaign for approval
  submitCampaignForApproval: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/submit`
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting campaign ${id} for approval:`, error);
      throw error;
    }
  },

  // Schedule campaign
  scheduleCampaign: async (id, targetCount) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/schedule?targetCount=${targetCount}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error scheduling campaign ${id}:`, error);
      throw error;
    }
  },

  // Start campaign
  startCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/start`
      );
      return response.data;
    } catch (error) {
      console.error(`Error starting campaign ${id}:`, error);
      throw error;
    }
  },

  // Complete campaign
  completeCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/complete`
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing campaign ${id}:`, error);
      throw error;
    }
  },

  // Cancel campaign
  cancelCampaign: async (id, notes) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/cancel?notes=${encodeURIComponent(
          notes
        )}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error canceling campaign ${id}:`, error);
      throw error;
    }
  },

  // Get campaigns by status
  getCampaignsByStatus: async (status) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/campaigns/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns with status ${status}:`, error);
      throw error;
    }
  },

  // Get upcoming campaigns
  getUpcomingCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get(
        "/health-check/campaigns/upcoming"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming campaigns:", error);
      throw error;
    }
  },

  // Get completed campaigns
  getCompletedCampaigns: async () => {
    try {
      const response = await healthCheckApiClient.get(
        "/health-check/campaigns/completed"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching completed campaigns:", error);
      throw error;
    }
  },

  // Get available health check categories
  getAvailableCategories: async () => {
    try {
      const response = await healthCheckApiClient.get(
        "/health-check/campaigns/categories"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching health check categories:", error);
      throw error;
    }
  },

  // Get health check results by campaign
  getResultsByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/campaign/${campaignId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching results for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Record health check result
  recordResult: async (resultData) => {
    try {
      const response = await healthCheckApiClient.post(
        "/health-check/results",
        resultData
      );
      return response.data;
    } catch (error) {
      console.error("Error recording health check result:", error);
      throw error;
    }
  },

  // Get eligible students with flexible filtering (supports single/multiple classes, with/without age range)
  getEligibleStudentsWithFilters: async (campaignId, filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.minAge !== undefined && filters.minAge !== null) {
        params.append("minAge", filters.minAge);
      }
      if (filters.maxAge !== undefined && filters.maxAge !== null) {
        params.append("maxAge", filters.maxAge);
      }

      // Support both single className and multiple classNames
      if (filters.className) {
        params.append("classNames", filters.className);
      }
      if (filters.classNames && filters.classNames.length > 0) {
        filters.classNames.forEach((className) => {
          params.append("classNames", className);
        });
      }

      const queryString = params.toString();
      const url = `/health-check/forms/campaign/${campaignId}/eligible-students${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await healthCheckApiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching eligible students with filters for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Generate forms for eligible students based on filters
  generateFormsForEligibleStudents: async (campaignId, filters = {}) => {
    try {
      // First get eligible students using the unified filter API
      const eligibleResponse =
        await healthCheckApi.getEligibleStudentsWithFilters(
          campaignId,
          filters
        );
      const studentIds = eligibleResponse.students.map(
        (student) => student.studentID
      );

      // Then generate forms for these students
      const response = await healthCheckApiClient.post(
        `/health-check/forms/campaign/${campaignId}/students`,
        studentIds
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error generating forms for eligible students in campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Manager-specific APIs

  // Approve campaign (Manager only)
  approveCampaign: async (id) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/approve`
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving campaign ${id}:`, error);
      throw error;
    }
  },

  // Reject campaign (Manager only)
  rejectCampaign: async (id, notes) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${id}/reject?notes=${encodeURIComponent(
          notes
        )}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting campaign ${id}:`, error);
      throw error;
    }
  },

  // Health Check Forms APIs for Manager
  getFormsByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/forms/campaign/${campaignId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for campaign ${campaignId}:`, error);
      throw error;
    }
  },

  getFormsByCampaignAndStatus: async (campaignId, status) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/forms/campaign/${campaignId}/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching forms for campaign ${campaignId} with status ${status}:`,
        error
      );
      throw error;
    }
  },

  getFormById: async (formId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/forms/${formId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching form ${formId}:`, error);
      throw error;
    }
  },

  getConfirmedCountByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/forms/campaign/${campaignId}/count/confirmed`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching confirmed count for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  getPendingCountByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/forms/campaign/${campaignId}/count/pending`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching pending count for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Health Check Results APIs for Manager
  getResultsByStudent: async (studentId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching results for student ${studentId}:`, error);
      throw error;
    }
  },

  getResultsByCategory: async (category) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/category/${category}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching results for category ${category}:`, error);
      throw error;
    }
  },

  getAbnormalResults: async () => {
    try {
      const response = await healthCheckApiClient.get(
        "/health-check/results/abnormal"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching abnormal results:", error);
      throw error;
    }
  },

  getResultsByStatus: async (status) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching results with status ${status}:`, error);
      throw error;
    }
  },

  getResultsByCampaignAndCategory: async (campaignId, category) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/campaign/${campaignId}/category/${category}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching results for campaign ${campaignId} and category ${category}:`,
        error
      );
      throw error;
    }
  },

  countAbnormalResultsByCampaign: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/campaign/${campaignId}/abnormal/count`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error counting abnormal results for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  getResultById: async (resultId) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/results/${resultId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching result ${resultId}:`, error);
      throw error;
    }
  },

  getActiveCampaignsByClass: async (className) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/campaigns/class/${className}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching active campaigns for class ${className}:`,
        error
      );
      throw error;
    }
  },

  // Calculate target count for campaign
  calculateTargetCount: async (minAge, maxAge, targetClasses) => {
    try {
      const params = new URLSearchParams();
      if (minAge !== null && minAge !== undefined) {
        params.append("minAge", minAge);
      }
      if (maxAge !== null && maxAge !== undefined) {
        params.append("maxAge", maxAge);
      }
      if (targetClasses && targetClasses.length > 0) {
        targetClasses.forEach((cls) => params.append("targetClasses", cls));
      }

      const response = await healthCheckApiClient.get(
        `/health-check/campaigns/calculate-target-count?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error calculating target count:", error);
      throw error;
    }
  },

  sendNotificationsToParents: async (campaignId) => {
    try {
      const response = await healthCheckApiClient.post(
        `/health-check/campaigns/${campaignId}/send-notifications`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error sending notifications to parents for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  // Get eligible students with their form status for a campaign
  getEligibleStudentsWithStatus: async (campaignId, campaignData = null) => {
    try {
      // Get all forms for the campaign to determine status
      const formsResponse = await healthCheckApiClient.get(
        `/health-check/forms/campaign/${campaignId}`
      );
      let forms = formsResponse.data;

      // Ensure forms is an array
      if (!Array.isArray(forms)) {
        console.warn("Forms response is not an array:", forms);
        forms = [];
      }

      // Get eligible students using campaign criteria if provided
      let studentsResponse;

      // Enhanced condition checking - always use filtered endpoint if we have any criteria
      const hasAgeFilter =
        campaignData &&
        ((campaignData.minAge !== undefined && campaignData.minAge !== null) ||
          (campaignData.maxAge !== undefined && campaignData.maxAge !== null));

      const hasClassFilter =
        campaignData &&
        campaignData.targetClasses &&
        Array.isArray(campaignData.targetClasses) &&
        campaignData.targetClasses.length > 0;

      console.log("🔍 Condition check:", {
        hasCampaignData: !!campaignData,
        hasAgeFilter,
        hasClassFilter,
        minAge: campaignData?.minAge,
        maxAge: campaignData?.maxAge,
        targetClasses: campaignData?.targetClasses,
        shouldUseFilter: hasAgeFilter || hasClassFilter,
      });

      if (campaignData && (hasAgeFilter || hasClassFilter)) {
        // Build query parameters for the filtered API
        const params = new URLSearchParams();

        if (campaignData.minAge !== undefined && campaignData.minAge !== null) {
          params.append("minAge", campaignData.minAge);
        }
        if (campaignData.maxAge !== undefined && campaignData.maxAge !== null) {
          params.append("maxAge", campaignData.maxAge);
        }

        // Handle targetClasses - it might be a Set or Array
        if (hasClassFilter) {
          const classArray = Array.isArray(campaignData.targetClasses)
            ? campaignData.targetClasses
            : Array.from(campaignData.targetClasses);

          classArray.forEach((className) => {
            if (className && className.trim()) {
              params.append("classNames", className.trim());
            }
          });
        }

        const queryString = params.toString();
        const url = `/health-check/forms/campaign/${campaignId}/eligible-students${
          queryString ? `?${queryString}` : ""
        }`;

        console.log("🎯 Fetching eligible students with filters:", {
          campaignId,
          minAge: campaignData.minAge,
          maxAge: campaignData.maxAge,
          targetClasses: campaignData.targetClasses,
          url,
          params: queryString,
        });

        studentsResponse = await healthCheckApiClient.get(url);
      } else {
        // Fallback to basic API without filters
        console.log(
          "🔄 Fetching eligible students without filters for campaign:",
          campaignId,
          "Reason: No valid filter criteria found"
        );

        // Try multiple fallback endpoints
        try {
          studentsResponse = await healthCheckApiClient.get(
            `/health-check/forms/campaign/${campaignId}/eligible-students`
          );
          console.log("✅ Basic API successful");
        } catch (error) {
          console.warn(
            "⚠️ Basic API failed, trying alternative endpoint:",
            error.message
          );

          // Try alternative endpoint
          try {
            studentsResponse = await healthCheckApiClient.get(
              `/api/students/eligible-for-campaign/${campaignId}`
            );
            console.log("✅ Alternative API successful");
          } catch (altError) {
            console.error("❌ All API endpoints failed:", altError.message);
            throw altError;
          }
        }
      }

      // Handle different response structures from various endpoints
      let eligibleStudents;

      if (studentsResponse.data && studentsResponse.data.students) {
        // Format: { message: "...", students: [...] }
        eligibleStudents = studentsResponse.data.students;
      } else if (Array.isArray(studentsResponse.data)) {
        // Format: [student1, student2, ...]
        eligibleStudents = studentsResponse.data;
      } else if (
        studentsResponse.data &&
        typeof studentsResponse.data === "object"
      ) {
        // Check if it's a nested structure
        const possibleStudentsArrays = [
          "data",
          "students",
          "eligibleStudents",
          "result",
        ];

        for (const key of possibleStudentsArrays) {
          if (Array.isArray(studentsResponse.data[key])) {
            eligibleStudents = studentsResponse.data[key];
            break;
          }
        }

        if (!eligibleStudents) {
          eligibleStudents = [];
        }
      } else {
        eligibleStudents = [];
      }

      // Create a map of student ID to form status
      const formStatusMap = {};
      forms.forEach((form) => {
        if (form.student && form.student.studentID) {
          formStatusMap[form.student.studentID] = {
            status: form.status,
            statusDisplay:
              form.status === "CONFIRMED"
                ? "Đã xác nhận khám"
                : form.status === "DECLINED"
                ? "Từ chối khám"
                : form.status === "PENDING"
                ? "Chưa phản hồi"
                : "Chưa phản hồi",
          };
        }
      });

      // Helper function to calculate age from date of birth
      const calculateAge = (dob) => {
        if (!dob) return { years: 0, months: 0, totalMonths: 0 };

        const today = new Date();
        const birthDate = new Date(dob);
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();

        if (months < 0) {
          years--;
          months += 12;
        }

        const totalMonths = years * 12 + months;
        return {
          years,
          months,
          totalMonths,
        };
      };

      const studentsArray = Array.isArray(eligibleStudents)
        ? eligibleStudents
        : [];

      const studentsWithStatus = studentsArray.map((student) => {
        const statusInfo = formStatusMap[student.studentID] || {
          status: "PENDING",
          statusDisplay: "Chưa phản hồi",
        };

        const ageInfo = calculateAge(student.dob);
        const ageDisplay = `${ageInfo.years} tuổi ${ageInfo.months} tháng (${ageInfo.totalMonths} tháng)`;

        return {
          ...student,
          studentCode: student.studentID, // Map studentID to studentCode for table display
          fullName: student.lastName + " " + student.firstName,
          status: statusInfo.status,
          statusDisplay: statusInfo.statusDisplay,
          ageDisplay: ageDisplay,
        };
      });

      return studentsWithStatus;
    } catch (error) {
      console.error(
        `Error fetching eligible students with status for campaign ${campaignId}:`,
        error
      );
      throw error;
    }
  },

  getCampaignByFormIdForParent: async (formId, token = getTokenFromStorage()) => {
    try {
      const response = await healthCheckApiClient.get(
        `/health-check/campaigns/form/${formId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching campaign by form ID ${formId}:`,
        error
      );
      throw error;
    }
  }
  
};
