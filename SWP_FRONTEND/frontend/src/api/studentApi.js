// ==================== STUDENT API ====================
// API functions for student management

import { API_CONFIG, getAuthHeaders, handleApiError } from "./index";

const STUDENT_API_BASE = `${API_CONFIG.BASE_URL}/manager/students`;

// ==================== STUDENT CRUD OPERATIONS ====================

/**
 * Tạo học sinh cùng với phụ huynh
 * @param {Object} studentData - Dữ liệu học sinh và phụ huynh
 * @returns {Promise<Object>} Response data
 */
export const createStudentWithParents = async (studentData) => {
  try {
    const response = await fetch(`${STUDENT_API_BASE}/create-with-parents`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      handleApiError(error, "Không thể tạo học sinh và phụ huynh")
    );
  }
};

/**
 * Lấy danh sách tất cả học sinh
 * @returns {Promise<Array>} Danh sách học sinh
 */
export const getAllStudents = async () => {
  try {
    const response = await fetch(`${STUDENT_API_BASE}?_t=${Date.now()}`, {
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
    throw new Error(handleApiError(error, "Không thể lấy danh sách học sinh"));
  }
};

/**
 * Lọc học sinh theo nhiều tiêu chí
 * @param {Object} filterParams - Các tham số lọc
 * @param {string} [filterParams.searchName] - Tên học sinh cần tìm
 * @param {string} [filterParams.className] - Lớp học
 * @param {string} [filterParams.birthPlace] - Nơi sinh
 * @param {number} [filterParams.birthYear] - Năm sinh
 * @returns {Promise<Array>} Danh sách học sinh được lọc
 */
export const filterStudents = async (filterParams = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Chỉ thêm param nếu có giá trị
    if (filterParams.searchName?.trim()) {
      queryParams.append("searchName", filterParams.searchName.trim());
    }
    if (filterParams.className?.trim()) {
      queryParams.append("className", filterParams.className.trim());
    }
    if (filterParams.birthPlace?.trim()) {
      queryParams.append("birthPlace", filterParams.birthPlace.trim());
    }
    if (filterParams.birthYear) {
      queryParams.append("birthYear", filterParams.birthYear);
    }

    // Thêm timestamp để tránh cache
    queryParams.append("_t", Date.now());

    const response = await fetch(`${STUDENT_API_BASE}/filter?${queryParams}`, {
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
    throw new Error(handleApiError(error, "Không thể lọc danh sách học sinh"));
  }
};

/**
 * Lấy thông tin học sinh theo ID
 * @param {number} studentId - ID của học sinh
 * @returns {Promise<Object>} Thông tin học sinh
 */
export const getStudentById = async (studentId) => {
  try {
    const response = await fetch(`${STUDENT_API_BASE}/${studentId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể lấy thông tin học sinh"));
  }
};

/**
 * Toggle trạng thái học sinh (enable/disable)
 * @param {number} studentId - ID của học sinh cần toggle status
 * @returns {Promise<Object>} Response data
 */
export const deleteStudent = async (studentId) => {
  try {
    const response = await fetch(`${STUDENT_API_BASE}/${studentId}`, {
      method: "DELETE",
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
    throw new Error(
      handleApiError(error, "Không thể thay đổi trạng thái học sinh")
    );
  }
};

/**
 * Xóa liên kết phụ huynh khỏi học sinh
 * @param {number} studentId - ID của học sinh
 * @param {string} parentType - Loại phụ huynh ("father" hoặc "mother")
 * @returns {Promise<Object>} Response data
 */
export const removeParentFromStudent = async (studentId, parentType) => {
  try {
    const response = await fetch(
      `${STUDENT_API_BASE}/${studentId}/parents/${parentType}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể xóa liên kết phụ huynh"));
  }
};

// ==================== EXCEL OPERATIONS ====================

/**
 * Import học sinh từ file Excel
 * @param {File} file - File Excel
 * @returns {Promise<Object>} Response data
 */
export const importStudentsFromExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${STUDENT_API_BASE}/import-excel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể import file Excel"));
  }
};

/**
 * Tải template Excel
 * @returns {Promise<Blob>} File Excel template
 */
export const downloadExcelTemplate = async () => {
  try {
    const response = await fetch(`${STUDENT_API_BASE}/excel-template`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    throw new Error(handleApiError(error, "Không thể tải template Excel"));
  }
};
