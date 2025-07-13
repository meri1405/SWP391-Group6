const API_BASE_URL = "https://swp391-group6.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ==================== USER MANAGEMENT APIs ====================

// Get all users
export const getAllUsers = async () => {
  try {
    console.log("Making API request to:", `${API_BASE_URL}/admin/users`);
    console.log("Auth headers:", getAuthHeaders());

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API data received:", data);
    console.log("Data is array:", Array.isArray(data));
    console.log("Data length:", data.length);

    // Return the users array from the response
    return data.users || data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    console.log("adminApi.createUser received userData:", userData);

    // Block STUDENT role creation entirely
    if (userData.role === "STUDENT") {
      throw new Error(
        "STUDENT creation is not supported through this endpoint."
      );
    }

    // Format data for backend
    const requestData = {
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dob: userData.dob || userData.dateOfBirth,
      gender: userData.gender,
      email: userData.email,
      address: userData.address,
      jobTitle: userData.jobTitle,
      roleName: userData.role,
      status: userData.status,
      phone: userData.phone, // All supported roles (PARENT, SCHOOLNURSE, MANAGER, ADMIN) have phone
    };

    console.log("Formatted requestData:", requestData);

    // Add PARENT-specific fields
    if (userData.role === "PARENT") {
      requestData.studentIds = userData.studentIds || [];
    }

    console.log("Final requestData to be sent:", requestData);

    const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Success response:", data);
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Toggle user status (enable/disable)
export const toggleUserStatus = async (userId) => {
  try {
    console.log("Toggling user status for ID:", userId);

    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/toggle-status`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    console.log("Toggle status response:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Toggle status success:", data);
    return data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

// ==================== ADMIN PROFILE APIs ====================

// Get admin profile (full information from database)
export const getAdminProfile = async () => {
  try {
    console.log("Fetching admin profile from API...");

    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Admin profile response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Admin profile data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    throw error;
  }
};

// Update admin profile
export const updateAdminProfile = async (profileData) => {
  try {
    console.log("Updating admin profile:", profileData);

    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    console.log("Update admin profile response:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Admin profile updated successfully:", data);

    // Return the profile data from the response
    return data.profile || data;
  } catch (error) {
    console.error("Error updating admin profile:", error);
    throw error;
  }
};

// ==================== DASHBOARD & STATISTICS APIs ====================

// Get admin dashboard statistics
export const getAdminDashboardStats = async () => {
  try {
    console.log("Fetching admin dashboard statistics...");

    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dashboard stats received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Get system statistics
export const getSystemStats = async () => {
  try {
    console.log("Fetching system statistics...");

    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("System stats received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching system stats:", error);
    throw error;
  }
};

// ==================== SYSTEM MANAGEMENT APIs ====================

// Get public system information (no authentication required)
export const getPublicSystemInfo = async () => {
  try {
    console.log("Fetching public system info...");

    const response = await fetch(`${API_BASE_URL}/public/system-info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Public system info received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching public system info:", error);
    throw error;
  }
};

// Get system settings
export const getSystemSettings = async () => {
  try {
    console.log("Fetching system settings...");

    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("System settings received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettings = async (settingsData) => {
  try {
    console.log("Updating system settings:", settingsData);

    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("System settings updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw error;
  }
};

// ==================== AUDIT & LOGS APIs ====================

// Get audit logs
export const getAuditLogs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    console.log("Fetching audit logs with params:", params);

    const response = await fetch(
      `${API_BASE_URL}/admin/audit-logs?${queryParams}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Audit logs received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

// Export all functions for backward compatibility
export {
  // User Management
  getAllUsers as getUsers,
  getUserById as getUser,
  createUser as addUser,
  updateUser as editUser,
  deleteUser as removeUser,
  toggleUserStatus as toggleStatus,

  // Admin Profile
  getAdminProfile as getProfile,
  updateAdminProfile as updateProfile,

  // Dashboard
  getAdminDashboardStats as getDashboardStats,
  getSystemStats as getStats,

  // Settings
  getSystemSettings as getSettings,
  updateSystemSettings as saveSettings,

  // Logs
  getAuditLogs as getLogs,
};
