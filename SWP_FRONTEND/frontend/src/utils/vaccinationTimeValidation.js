/**
 * Vaccination Time Validation Utilities
 * Implements frontend validation to match backend business rules
 */

/**
 * Calculate hours elapsed since a given date
 * @param {string|Date|Array} startDate - The start date (can be array format from Java LocalDateTime)
 * @returns {number} Hours elapsed
 */
export const getHoursElapsed = (startDate) => {
  if (!startDate) return 0;
  
  let start;
  
  try {
    // Handle array format from Java LocalDateTime [year, month, day, hour, minute, second]
    if (Array.isArray(startDate)) {
      if (startDate.length >= 5) {
        // Month is 0-indexed in JavaScript, but 1-indexed in Java
        start = new Date(
          startDate[0], // year
          startDate[1] - 1, // month (convert from 1-indexed to 0-indexed)
          startDate[2], // day
          startDate[3] || 0, // hour
          startDate[4] || 0, // minute
          startDate[5] || 0  // second
        );
      } else {
        console.warn('Invalid date array format:', startDate);
        return 0;
      }
    } else {
      // Handle string or Date format
      start = new Date(startDate);
    }
    
    // Check if the date is valid
    if (isNaN(start.getTime())) {
      console.warn('Invalid date passed to getHoursElapsed:', startDate);
      return 0;
    }
    
    const now = new Date();
    const hoursElapsed = Math.floor((now - start) / (1000 * 60 * 60));
    
    // Debug logging with safe date formatting
    console.log('DEBUG - getHoursElapsed:', {
      startDate,
      start: start.toISOString(),
      now: now.toISOString(),
      hoursElapsed,
      millisecondsDiff: now - start
    });
    
    return hoursElapsed;
  } catch (error) {
    console.error('Error calculating hours elapsed:', error, 'startDate:', startDate);
    return 0;
  }
};

/**
 * Calculate remaining hours until deadline
 * @param {string|Date} startDate - The start date
 * @param {number} deadlineHours - Deadline in hours
 * @returns {number} Remaining hours (can be negative if deadline passed)
 */
export const getRemainingHours = (startDate, deadlineHours) => {
  const elapsed = getHoursElapsed(startDate);
  return deadlineHours - elapsed;
};

/**
 * Check if manager can still approve/reject a vaccination campaign
 * Business rule: Manager has 24 hours from campaign creation
 * @param {string|Date} createdDate - Campaign creation date
 * @returns {Object} Validation result
 */
export const validateManagerCampaignAction = (createdDate) => {
  const hoursElapsed = getHoursElapsed(createdDate);
  const remainingHours = getRemainingHours(createdDate, 24);
  
  return {
    canAct: hoursElapsed <= 24,
    hoursElapsed,
    remainingHours: Math.max(0, remainingHours),
    isExpired: hoursElapsed > 24,
    message: hoursElapsed > 24 
      ? `Đã quá thời hạn phê duyệt (${hoursElapsed} giờ đã trôi qua, giới hạn 24 giờ)`
      : `Còn ${Math.max(0, remainingHours)} giờ để phê duyệt`
  };
};

/**
 * Check if parent can still confirm/decline a vaccination form
 * Business rule: Parent has 48 hours from form sent date
 * @param {string|Date} sentDate - Form sent date
 * @returns {Object} Validation result
 */
export const validateParentFormAction = (sentDate) => {
  if (!sentDate) {
    return {
      canAct: false,
      hoursElapsed: 0,
      remainingHours: 0,
      isExpired: false,
      message: "Phiếu chưa được gửi"
    };
  }

  const hoursElapsed = getHoursElapsed(sentDate);
  const remainingHours = getRemainingHours(sentDate, 48);
  
  return {
    canAct: hoursElapsed <= 48,
    hoursElapsed,
    remainingHours: Math.max(0, remainingHours),
    isExpired: hoursElapsed > 48,
    message: hoursElapsed > 48 
      ? `Đã quá thời hạn phản hồi (${hoursElapsed} giờ đã trôi qua, giới hạn 48 giờ)`
      : `Còn ${Math.max(0, remainingHours)} giờ để phản hồi`
  };
};

/**
 * Check if vaccination campaign date meets minimum preparation time
 * Business rule: Campaign date must be at least 4 days from creation
 * @param {string|Date} scheduledDate - Vaccination scheduled date
 * @param {string|Date} createdDate - Campaign creation date (optional, defaults to now)
 * @returns {Object} Validation result
 */
export const validateCampaignScheduleDate = (scheduledDate, createdDate = null) => {
  if (!scheduledDate) {
    return {
      isValid: false,
      message: "Ngày tiêm chưa được chọn"
    };
  }

  const scheduled = new Date(scheduledDate);
  const created = createdDate ? new Date(createdDate) : new Date();
  const daysDifference = Math.floor((scheduled - created) / (1000 * 60 * 60 * 24));
  
  return {
    isValid: daysDifference >= 4,
    daysDifference,
    message: daysDifference < 4 
      ? `Ngày tiêm phải cách ít nhất 4 ngày từ ngày tạo chiến dịch (hiện tại: ${daysDifference} ngày)`
      : `Ngày tiêm hợp lệ (cách ${daysDifference} ngày)`
  };
};

/**
 * Get status badge color and text based on time validation
 * @param {Object} validation - Validation result from above functions
 * @returns {Object} Status info for UI display
 */
export const getTimeValidationStatus = (validation) => {
  if (validation.isExpired || !validation.canAct) {
    return {
      color: 'error',
      status: 'error',
      text: 'Hết hạn',
      variant: 'filled'
    };
  }
  
  if (validation.remainingHours <= 2) {
    return {
      color: 'warning',
      status: 'warning', 
      text: 'Sắp hết hạn',
      variant: 'filled'
    };
  }
  
  return {
    color: 'success',
    status: 'success',
    text: 'Còn thời gian',
    variant: 'outlined'
  };
};

/**
 * Format time remaining for display
 * @param {number} hours - Hours remaining
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (hours) => {
  if (hours <= 0) return "Đã hết hạn";
  
  if (hours < 24) {
    return `${hours} giờ`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days} ngày`;
  }
  
  return `${days} ngày ${remainingHours} giờ`;
};

/**
 * Check if campaign should show reminder warning
 * @param {string|Date} createdDate - Campaign creation date
 * @param {boolean} reminderSent - Whether reminder was already sent
 * @returns {boolean} Should show reminder warning
 */
export const shouldShowReminderWarning = (createdDate, reminderSent = false) => {
  const hoursElapsed = getHoursElapsed(createdDate);
  return hoursElapsed >= 12 && !reminderSent;
};

/**
 * Check if form should show reminder warning
 * @param {string|Date} sentDate - Form sent date
 * @param {boolean} reminderSent - Whether reminder was already sent
 * @returns {boolean} Should show reminder warning
 */
export const shouldShowFormReminderWarning = (sentDate, reminderSent = false) => {
  if (!sentDate) return false;
  const hoursElapsed = getHoursElapsed(sentDate);
  return hoursElapsed >= 24 && !reminderSent;
};
