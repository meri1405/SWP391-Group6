import dayjs from 'dayjs';

/**
 * Utility functions for health profile operations
 */

/**
 * Calculate BMI and return the appropriate category
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {string} BMI category in Vietnamese
 */
export const getBMICategory = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return 'Không xác định';
  }
  
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi < 25) return 'Bình thường';
  if (bmi < 30) return 'Thừa cân';
  return 'Béo phì';
};

/**
 * Calculate BMI value
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI value rounded to 1 decimal place
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return 0;
  }
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
};

/**
 * Get formatted student name
 * @param {Object} student - Student object
 * @returns {string} Formatted student name
 */
export const getStudentName = (student) => {
  if (!student) return 'Học sinh';
  return student.firstName && student.lastName 
    ? `${student.lastName} ${student.firstName}` 
    : student.name || 'Tên không có';
};

/**
 * Get student ID, handling different possible ID field names
 * @param {Object} student - Student object
 * @returns {string|number|null} Student ID or null if not found
 */
export const getStudentId = (student) => {
  if (!student) return null;
  return student.id || student.studentID;
};

/**
 * Get translated allergy severity status
 * @param {string} status - Allergy status in English
 * @returns {string} Translated status in Vietnamese
 */
export const getAllergyStatusText = (status) => {
  const statusMap = {
    'MILD': 'Nhẹ',
    'MODERATE': 'Trung bình',
    'SEVERE': 'Nặng'
  };
  return statusMap[status] || 'Không xác định';
};

/**
 * Get color for allergy severity status
 * @param {string} status - Allergy status in English
 * @returns {string} Ant Design color name
 */
export const getAllergyStatusColor = (status) => {
  const colorMap = {
    'MILD': 'green',
    'MODERATE': 'orange',
    'SEVERE': 'red'
  };
  return colorMap[status] || 'blue';
};

/**
 * Get translated chronic disease status
 * @param {string} status - Disease status in English
 * @returns {string} Translated status in Vietnamese
 */
export const getChronicDiseaseStatusText = (status) => {
  const statusMap = {
    'UNDER_TREATMENT': 'Đang điều trị',
    'RECOVERED': 'Đã khỏi',
    'STABLE': 'Ổn định',
    'WORSENED': 'Đang xấu đi',
    'RELAPSED': 'Tái phát',
    'NEWLY_DIAGNOSED': 'Mới chẩn đoán',
    'UNDER_OBSERVATION': 'Đang theo dõi',
    'UNKNOWN': 'Không rõ',
    'ISOLATED': 'Cách ly',
    'UNTREATED': 'Chưa điều trị'
  };
  return statusMap[status] || 'Không xác định';
};

/**
 * Get color for chronic disease status
 * @param {string} status - Disease status in English
 * @returns {string} Ant Design color name
 */
export const getChronicDiseaseStatusColor = (status) => {
  const colorMap = {
    'RECOVERED': 'green',
    'UNDER_TREATMENT': 'orange',
    'STABLE': 'blue',
    'WORSENED': 'red',
    'RELAPSED': 'volcano',
    'NEWLY_DIAGNOSED': 'purple',
    'UNDER_OBSERVATION': 'cyan',
    'ISOLATED': 'magenta',
    'UNTREATED': 'gold'
  };
  return colorMap[status] || 'default';
};

/**
 * Validate if a profile has required basic information
 * @param {Object} profile - Health profile object
 * @returns {boolean} True if profile has basic required fields
 */
export const validateProfileBasicInfo = (profile) => {
  return !!(profile && profile.weight && profile.height);
};

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Check if data array has content
 * @param {Array} data - Array to check
 * @returns {boolean} True if array exists and has content
 */
export const hasContent = (data) => {
  return data && Array.isArray(data) && data.length > 0;
};
