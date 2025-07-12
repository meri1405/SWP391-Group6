/**
 * Utility functions for vaccination schedule formatting and validation
 */

/**
 * Formats a date string to Vietnamese locale format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

/**
 * Gets the color for a priority level
 * @param {string} priority - Priority level (high, medium, low)
 * @returns {string} Color code
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "#f44336";
    case "medium":
      return "#ff9800";
    case "low":
      return "#4caf50";
    default:
      return "#666";
  }
};

/**
 * Gets the Vietnamese text for a priority level
 * @param {string} priority - Priority level (high, medium, low)
 * @returns {string} Vietnamese priority text
 */
export const getPriorityText = (priority) => {
  switch (priority) {
    case "high":
      return "Cao";
    case "medium":
      return "Trung bình";
    case "low":
      return "Thấp";
    default:
      return "";
  }
};

/**
 * Validates if a vaccination record has all required fields
 * @param {Object} vaccination - Vaccination record to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateVaccinationRecord = (vaccination) => {
  return !!(
    vaccination &&
    vaccination.id &&
    vaccination.vaccine &&
    vaccination.studentName
  );
};

/**
 * Sorts vaccinations by date (newest first)
 * @param {Array} vaccinations - Array of vaccination records
 * @returns {Array} Sorted array
 */
export const sortVaccinationsByDate = (vaccinations) => {
  return [...vaccinations].sort((a, b) => {
    const dateA = new Date(a.date || a.scheduledDate);
    const dateB = new Date(b.date || b.scheduledDate);
    return dateB - dateA;
  });
};
