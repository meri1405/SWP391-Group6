const API_BASE_URL = "https://swp391-group6.onrender.com/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/reset-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
};

// First-time login functions
export const checkFirstLogin = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-first-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
};

export const sendOtpForPasswordChange = async (email) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/send-otp-password-change`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
};

export const verifyOtpAndChangePasswordWithUsername = async (email, otp, newPassword, newUsername) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/verify-otp-change-password-username`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword, newUsername }),
      }
    );

    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
};

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

    // Get response as text first to debug JSON issues
    const responseText = await response.text();
    console.log("Raw response text:", responseText);

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response text that failed to parse:", responseText);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    console.log("Parsed API data:", data);
    console.log("Data type:", typeof data);
    console.log("Data is array:", Array.isArray(data));

    if (Array.isArray(data)) {
      console.log("Data length:", data.length);
    } else if (data && typeof data === "object") {
      console.log("Data keys:", Object.keys(data));
    }

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

// Create new staff user (Admin only creates staff: ADMIN, MANAGER, SCHOOLNURSE)
export const createUser = async (userData) => {
  try {
    console.log("🔧 userApi.createUser received userData:", userData);

    // Only allow staff role creation through admin
    const allowedRoles = ["ADMIN", "MANAGER", "SCHOOLNURSE"];
    if (!allowedRoles.includes(userData.role)) {
      throw new Error(
        `Admin can only create staff accounts. Role '${userData.role}' is not supported.`
      );
    }

    // Format data for backend - only staff-relevant fields
    const requestData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      dob: userData.dob || userData.dateOfBirth,
      gender: userData.gender,
      email: userData.email,
      address: userData.address,
      jobTitle: userData.jobTitle,
      roleName: userData.role,
      status: userData.status,
      phone: userData.phone,
    };

    // Only include username and password if they're provided (for editing existing users)
    if (userData.username) {
      requestData.username = userData.username;
    }
    if (userData.password) {
      requestData.password = userData.password;
    }

    console.log("🔧 Formatted requestData:", requestData);
    console.log("🚀 Final requestData to be sent:", requestData);

    const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("✅ Success response:", data);
    return data;
  } catch (error) {
    console.error("❌ Error creating user:", error);
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

// Logout user
export const logout = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};
