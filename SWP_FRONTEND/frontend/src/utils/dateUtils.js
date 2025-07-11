import dayjs from "dayjs";

/**
 * Safely format a date with validation
 * @param {string|Date|null|undefined} date - The date to format
 * @param {string} format - The format string (default: 'DD/MM/YYYY')
 * @param {string} fallback - The fallback text for invalid dates (default: 'Chưa có thông tin')
 * @returns {string} The formatted date or fallback text
 */
export const formatDateSafe = (
  date,
  format = "DD/MM/YYYY",
  fallback = "Chưa có thông tin"
) => {
  if (!date || date === "null" || date === "undefined" || date === "") {
    return fallback;
  }

  const dayjsDate = dayjs(date);
  return dayjsDate.isValid() ? dayjsDate.format(format) : fallback;
};

/**
 * Safely format a date with time
 * @param {string|Date|null|undefined} date - The date to format
 * @param {string} fallback - The fallback text for invalid dates (default: 'Chưa có thông tin')
 * @returns {string} The formatted date with time or fallback text
 */
export const formatDateTimeSafe = (date, fallback = "Chưa có thông tin") => {
  return formatDateSafe(date, "DD/MM/YYYY HH:mm", fallback);
};

/**
 * Safely format a date for sent dates (with specific fallback)
 * @param {string|Date|null|undefined} date - The date to format
 * @returns {string} The formatted date or 'Chưa gửi'
 */
export const formatSentDateSafe = (date) => {
  return formatDateTimeSafe(date, "Chưa gửi");
};

/**
 * Check if a date is valid
 * @param {string|Date|null|undefined} date - The date to check
 * @returns {boolean} True if the date is valid
 */
export const isValidDate = (date) => {
  if (!date || date === "null" || date === "undefined" || date === "") {
    return false;
  }

  return dayjs(date).isValid();
};

/**
 * Convert a date to ISO string safely
 * @param {string|Date|null|undefined} date - The date to convert
 * @returns {string|null} The ISO string or null if invalid
 */
export const toISOStringSafe = (date) => {
  if (!isValidDate(date)) {
    return null;
  }

  return dayjs(date).toISOString();
};
