/**
 * Time formatting utilities for the application
 */

/**
 * Parse a date string, array, or Date object and return a valid Date object
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export const parseDate = (dateInput) => {
  if (!dateInput) return null;
  
  // If it's already a Date object
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  
  // If it's an array (from Java LocalDateTime serialization)
  if (Array.isArray(dateInput)) {
    try {
      // Array format: [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateInput;
      
      // Create date object (month is 0-indexed in JavaScript)
      const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
      
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.warn('Error parsing date array:', dateInput, error);
      return null;
    }
  }
  
  // Try to parse the string
  const date = new Date(dateInput);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    // Try alternative parsing for different formats
    const timestamp = Date.parse(dateInput);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    return null;
  }
  
  return date;
};

/**
 * Format time ago in Vietnamese with proper error handling
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {string} - Formatted time ago string
 */
export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "Không xác định";

  const notificationDate = parseDate(dateInput);
  
  if (!notificationDate) {
    console.warn('Invalid date format:', dateInput);
    return "Thời gian không hợp lệ";
  }

  const now = new Date();
  const diffInMs = now.getTime() - notificationDate.getTime();
  
  // If the notification is in the future, show "Vừa xong"
  if (diffInMs < 0) {
    return "Vừa xong";
  }
  
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 30) {
    return "Vừa xong";
  } else if (diffInSeconds < 60) {
    return "Vài giây trước";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  } else {
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} năm trước`;
  }
};

/**
 * Format a date to Vietnamese format (DD/MM/YYYY HH:mm)
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "Không xác định";

  const date = parseDate(dateInput);
  
  if (!date) {
    return "Ngày không hợp lệ";
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format a date to Vietnamese format with day name
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {string} - Formatted date string with day name
 */
export const formatDateWithDayName = (dateInput) => {
  if (!dateInput) return "Không xác định";

  const date = parseDate(dateInput);
  
  if (!date) {
    return "Ngày không hợp lệ";
  }

  const dayNames = [
    'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 
    'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
  ];

  const dayName = dayNames[date.getDay()];
  const formattedDate = formatDate(date);

  return `${dayName}, ${formattedDate}`;
};

/**
 * Check if a date is today
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {boolean} - True if the date is today
 */
export const isToday = (dateInput) => {
  const date = parseDate(dateInput);
  if (!date) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {boolean} - True if the date is yesterday
 */
export const isYesterday = (dateInput) => {
  const date = parseDate(dateInput);
  if (!date) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Get a relative date description (Today, Yesterday, or formatted date)
 * @param {string|Date|Array} dateInput - Date string, Date object, or array from Java LocalDateTime
 * @returns {string} - Relative date description
 */
export const getRelativeDateDescription = (dateInput) => {
  if (!dateInput) return "Không xác định";

  const date = parseDate(dateInput);
  if (!date) return "Ngày không hợp lệ";

  if (isToday(dateInput)) {
    return "Hôm nay";
  } else if (isYesterday(dateInput)) {
    return "Hôm qua";
  } else {
    return formatDate(dateInput);
  }
};
