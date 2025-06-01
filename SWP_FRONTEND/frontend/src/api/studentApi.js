const API_BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all students (admin only)
export const getAllStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/students`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get student by ID
export const getStudentById = async (studentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/students/${studentId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

// Create new student
export const createStudent = async (studentData) => {
  try {
    console.log("Creating student with data:", studentData);
    console.log("Auth headers:", getAuthHeaders());

    const response = await fetch(`${API_BASE_URL}/admin/students/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Student created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

// Link parent to student
export const linkParentToStudent = async (studentId, parentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/students/${studentId}/parents/${parentId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error linking parent to student:", error);
    throw error;
  }
};

// Remove parent from student
export const removeParentFromStudent = async (studentId, parentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/students/${studentId}/parents/${parentId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing parent from student:", error);
    throw error;
  }
};
