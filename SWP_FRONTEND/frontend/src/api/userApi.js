const API_BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
    // Format data for backend
    const requestData = {
      username: userData.username || null,
      password: userData.password || null,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dob: userData.dateOfBirth || userData.dob, // Handle both field names
      gender: userData.gender,
      phone: userData.phone,
      email: userData.email || null,
      address: userData.address,
      jobTitle: userData.jobTitle,
      roleName: userData.role,
    };

    console.log("Creating user with data:", requestData);
    console.log("Auth headers:", getAuthHeaders());

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
