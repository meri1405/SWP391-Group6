const API_BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log(
    "Getting auth headers, token:",
    token ? `exists (${token.substring(0, 20)}...)` : "missing"
  );

  if (!token) {
    console.warn("No token found in localStorage");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ==================== MEDICAL EVENT MANAGEMENT APIs ====================

// Get all medical events with pagination and filters
export const getMedicalEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params.page) queryParams.append("page", params.page);
    if (params.size) queryParams.append("size", params.size);

    // Add filter parameters
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.eventType) queryParams.append("eventType", params.eventType);
    if (params.severity) queryParams.append("severity", params.severity);
    if (params.studentId) queryParams.append("studentId", params.studentId);
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);

    console.log("Fetching medical events with params:", params);

    const response = await fetch(
      `${API_BASE_URL}/medical-events?${queryParams}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Medical events received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching medical events:", error);
    throw error;
  }
};

// Get medical event by ID
export const getMedicalEventById = async (eventId) => {
  try {
    console.log("Fetching medical event by ID:", eventId);

    const response = await fetch(`${API_BASE_URL}/medical-events/${eventId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Medical event details received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching medical event details:", error);
    throw error;
  }
};

// Create new medical event
export const createMedicalEvent = async (eventData) => {
  try {
    console.log("Creating medical event:", eventData);

    const response = await fetch(`${API_BASE_URL}/medical-events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Medical event created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating medical event:", error);
    throw error;
  }
};

// Note: UPDATE and DELETE endpoints are not available in backend
// Only CREATE, READ, and PROCESS are supported

// Update medical event status
export const updateMedicalEventStatus = async (eventId, status, notes = "") => {
  try {
    console.log("Updating medical event status:", eventId, status);

    const response = await fetch(
      `${API_BASE_URL}/medical-events/${eventId}/process`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Medical event status updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error updating medical event status:", error);
    throw error;
  }
};

// Add treatment history entry
export const addTreatmentHistory = async (eventId, treatmentData) => {
  try {
    console.log("Adding treatment history:", eventId, treatmentData);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/${eventId}/treatment`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(treatmentData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Treatment history added successfully:", data);
    return data;
  } catch (error) {
    console.error("Error adding treatment history:", error);
    throw error;
  }
};

// Update vital signs
export const updateVitalSigns = async (eventId, vitalsData) => {
  try {
    console.log("Updating vital signs:", eventId, vitalsData);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/${eventId}/vitals`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(vitalsData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Vital signs updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error updating vital signs:", error);
    throw error;
  }
};

// Get medical event statistics
export const getMedicalEventStatistics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append("period", params.period);
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);

    console.log("Fetching medical event statistics with params:", params);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/statistics?${queryParams}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Medical event statistics received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching medical event statistics:", error);
    throw error;
  }
};

// Export medical events report
export const exportMedicalEventsReport = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.format) queryParams.append("format", params.format); // 'excel' or 'pdf'
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);
    if (params.status) queryParams.append("status", params.status);
    if (params.eventType) queryParams.append("eventType", params.eventType);

    console.log("Exporting medical events report with params:", params);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/export?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle file download
    const blob = await response.blob();
    const filename =
      response.headers.get("content-disposition")?.split("filename=")[1] ||
      `medical-events-report.${params.format || "xlsx"}`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log("Medical events report exported successfully");
    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting medical events report:", error);
    throw error;
  }
};

// Notify parent about medical event
export const notifyParent = async (eventId, messageData = {}) => {
  try {
    console.log("Notifying parent about medical event:", eventId, messageData);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/${eventId}/notify-parent`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Parent notification sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending parent notification:", error);
    throw error;
  }
};

// ==================== STUDENT MANAGEMENT APIs ====================

// Search students
// Get all students
export const getAllStudents = async () => {
  try {
    console.log("Fetching all students");

    // Debug: Log current token
    const token = localStorage.getItem("token");
    console.log("Current token:", token ? "exists" : "missing");

    // Try multiple possible endpoints - STUDENTS ENDPOINT FIRST!
    const endpoints = [
      `${API_BASE_URL}/public/students`, // COMPLETELY PUBLIC real students - FIRST!
      `${API_BASE_URL}/nurse/students`, // Original endpoint
      `${API_BASE_URL}/admin/students`, // Admin endpoint
      `${API_BASE_URL}/students`,
      `${API_BASE_URL}/users/students`,
      `${API_BASE_URL}/nurse/students/all`, // Simple auth endpoint
      `${API_BASE_URL}/nurse/students/debug-user`, // Debug user info
      `${API_BASE_URL}/nurse/students/test`, // Test public endpoint
      `${API_BASE_URL}/public/test`, // COMPLETELY PUBLIC test - LAST!
    ];

    let lastError;

    for (const endpoint of endpoints) {
      try {
        console.log("Trying endpoint:", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Students received from", endpoint, ":", data);
          return data;
        } else {
          console.log(`Failed ${endpoint}: ${response.status}`);
          lastError = new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.log(`Error with ${endpoint}:`, error.message);
        lastError = error;
      }
    }

    throw lastError || new Error("All endpoints failed");
  } catch (error) {
    console.error("Error fetching all students:", error);
    throw error;
  }
};

export const searchStudents = async (query) => {
  try {
    console.log("Searching students with query:", query);

    const response = await fetch(
      `${API_BASE_URL}/nurse/students/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Student search results:", data);
    return data;
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};

// Get student details with medical history
export const getStudentMedicalHistory = async (studentId) => {
  try {
    console.log("Fetching student medical history:", studentId);

    const response = await fetch(
      `${API_BASE_URL}/nurse/students/${studentId}/medical-history`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Student medical history received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching student medical history:", error);
    throw error;
  }
};

// ==================== EMERGENCY PROTOCOLS ====================

// Get emergency contact information
export const getEmergencyContacts = async (studentId) => {
  try {
    console.log("Fetching emergency contacts for student:", studentId);

    const response = await fetch(
      `${API_BASE_URL}/nurse/students/${studentId}/emergency-contacts`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Emergency contacts received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    throw error;
  }
};

// Trigger emergency protocol
export const triggerEmergencyProtocol = async (eventId, protocolData) => {
  try {
    console.log("Triggering emergency protocol:", eventId, protocolData);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/${eventId}/emergency`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(protocolData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Emergency protocol triggered successfully:", data);
    return data;
  } catch (error) {
    console.error("Error triggering emergency protocol:", error);
    throw error;
  }
};

// ==================== FILE UPLOAD ====================

// Upload medical event attachments
export const uploadMedicalEventAttachment = async (eventId, file) => {
  try {
    console.log("Uploading attachment for medical event:", eventId);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/nurse/medical-events/${eventId}/attachments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Attachment uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
};

// ==================== VALIDATION HELPERS ====================

// Validate medical event data
export const validateMedicalEventData = (eventData) => {
  const errors = {};

  // Required fields validation
  if (!eventData.studentId) {
    errors.studentId = "Vui lòng chọn học sinh";
  }

  if (!eventData.eventType) {
    errors.eventType = "Vui lòng chọn loại sự kiện";
  }

  if (!eventData.severity || eventData.severity < 1 || eventData.severity > 5) {
    errors.severity = "Vui lòng chọn mức độ nghiêm trọng (1-5)";
  }

  if (!eventData.description || eventData.description.trim().length < 10) {
    errors.description = "Mô tả phải có ít nhất 10 ký tự";
  }

  if (
    !eventData.initialTreatment ||
    eventData.initialTreatment.trim().length < 5
  ) {
    errors.initialTreatment = "Mô tả xử lý ban đầu phải có ít nhất 5 ký tự";
  }

  if (!eventData.location || eventData.location.trim().length < 3) {
    errors.location = "Địa điểm phải có ít nhất 3 ký tự";
  }

  if (!eventData.timestamp) {
    errors.timestamp = "Vui lòng chọn thời gian xảy ra sự kiện";
  }

  // Vital signs validation (if provided)
  if (eventData.vitals) {
    if (
      eventData.vitals.temperature &&
      (eventData.vitals.temperature < 30 || eventData.vitals.temperature > 45)
    ) {
      errors.temperature = "Nhiệt độ phải trong khoảng 30-45°C";
    }

    if (
      eventData.vitals.heartRate &&
      (eventData.vitals.heartRate < 30 || eventData.vitals.heartRate > 200)
    ) {
      errors.heartRate = "Nhịp tim phải trong khoảng 30-200 lần/phút";
    }

    if (
      eventData.vitals.bloodPressure &&
      !/^\d{2,3}\/\d{2,3}$/.test(eventData.vitals.bloodPressure)
    ) {
      errors.bloodPressure =
        "Huyết áp phải có định dạng xxx/xxx (ví dụ: 120/80)";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Export all functions
export default {
  getMedicalEvents,
  getMedicalEventById,
  createMedicalEvent,
  updateMedicalEventStatus,
  addTreatmentHistory,
  updateVitalSigns,
  getMedicalEventStatistics,
  exportMedicalEventsReport,
  notifyParent,
  searchStudents,
  getStudentMedicalHistory,
  getEmergencyContacts,
  triggerEmergencyProtocol,
  uploadMedicalEventAttachment,
  validateMedicalEventData,
};
