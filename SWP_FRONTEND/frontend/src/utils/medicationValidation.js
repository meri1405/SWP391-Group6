import dayjs from 'dayjs';

/**
 * Validation utilities for medication management
 * Contains all validation logic and rules
 */
export const medicationValidation = {
  /**
   * Validate start date - cannot be in the past
   * @param {dayjs.Dayjs} date - Date to validate
   * @returns {Promise} Validation promise
   */
  validateStartDate(date) {
    if (!date) return Promise.resolve();
    
    const today = dayjs().startOf('day');
    if (date.isBefore(today)) {
      return Promise.reject(new Error('Ngày bắt đầu không thể là ngày trong quá khứ'));
    }
    return Promise.resolve();
  },

  /**
   * Validate end date - must be after or equal to start date and not in the past
   * @param {dayjs.Dayjs} date - End date to validate
   * @param {number} itemIndex - Index of the medication item
   * @param {Object} form - Ant Design form instance
   * @returns {Promise} Validation promise
   */
  validateEndDate(date, itemIndex, form) {
    if (!date) return Promise.resolve();
    
    // Get start date for this specific item
    const startDate = form.getFieldValue(['itemRequests', itemIndex, 'startDate']);
    if (startDate && date.isBefore(startDate)) {
      return Promise.reject(new Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'));
    }
    
    const today = dayjs().startOf('day');
    if (date.isBefore(today)) {
      return Promise.reject(new Error('Ngày kết thúc không thể là ngày trong quá khứ'));
    }
    return Promise.resolve();
  },

  /**
   * Validate time slot - must be selected
   * @param {dayjs.Dayjs} time - Time to validate
   * @returns {Promise} Validation promise
   */
  validateTimeSlot(time) {
    if (!time) return Promise.reject(new Error('Vui lòng chọn thời gian'));
    return Promise.resolve();
  },

  /**
   * Validate confirmation checkbox
   * @param {boolean} isConfirmed - Confirmation status
   * @returns {boolean} Validation result
   */
  validateConfirmation(isConfirmed) {
    return isConfirmed;
  },

  /**
   * Validate student selection
   * @param {any} studentId - Selected student ID
   * @returns {boolean} Validation result
   */
  validateStudentSelection(studentId) {
    return !!studentId;
  },

  /**
   * Validate prescription images
   * @param {Array} prescriptionImages - Array of prescription images
   * @returns {boolean} Validation result
   */
  validatePrescriptionImages(prescriptionImages) {
    return prescriptionImages && prescriptionImages.length > 0;
  },

  /**
   * Validate medication items
   * @param {Array} itemRequests - Array of medication items
   * @returns {boolean} Validation result
   */
  validateMedicationItems(itemRequests) {
    return Array.isArray(itemRequests) && itemRequests.length > 0;
  },

  /**
   * Validate time slots for each medication item
   * @param {Array} itemRequests - Array of medication items
   * @returns {Object} Validation result with details
   */
  validateItemTimeSlots(itemRequests) {
    const errors = [];
    
    itemRequests.forEach((item, index) => {
      if (!item.timeSlots || item.timeSlots.length === 0) {
        errors.push(`Vui lòng chỉ định thời gian uống thuốc cho thuốc #${index + 1}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate schedule times consistency
   * @param {Array} itemRequests - Array of medication items
   * @returns {Object} Validation result with details
   */
  validateScheduleTimesConsistency(itemRequests) {
    const errors = [];
    
    itemRequests.forEach((item, index) => {
      if (item.timeSlots && item.frequency) {
        const scheduleTimes = item.timeSlots.map(time => time.format('HH:mm'));
        
        if (scheduleTimes.length === 0) {
          errors.push(`Vui lòng thiết lập thời gian sử dụng thuốc cho ${item.itemName || `thuốc #${index + 1}`}`);
        }
        
        if (scheduleTimes.length !== parseInt(item.frequency)) {
          errors.push(`Số lượng thời gian sử dụng thuốc cho ${item.itemName || `thuốc #${index + 1}`} phải khớp với tần suất (${item.frequency})`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate medication request status for operations
   * @param {string} status - Current status
   * @param {string} operation - Operation to perform ('edit' | 'delete')
   * @returns {Object} Validation result
   */
  validateStatusForOperation(status, operation) {
    const isPending = status === 'PENDING';
    
    return {
      isValid: isPending,
      message: isPending 
        ? null 
        : `Chỉ có thể ${operation === 'edit' ? 'chỉnh sửa' : 'xóa'} yêu cầu thuốc đang chờ duyệt`
    };
  },

  /**
   * Validate dosage value
   * @param {string|number} dosage - Dosage value
   * @returns {Object} Validation result
   */
  validateDosage(dosage) {
    const num = parseFloat(dosage);
    if (isNaN(num) || num < 0.1) {
      return {
        isValid: false,
        message: 'Liều lượng phải ít nhất là 0.1'
      };
    }
    return { isValid: true };
  },

  /**
   * Validate frequency value
   * @param {string|number} frequency - Frequency value
   * @returns {Object} Validation result
   */
  validateFrequency(frequency) {
    const num = parseInt(frequency);
    if (isNaN(num) || num < 1 || num > 10) {
      return {
        isValid: false,
        message: 'Tần suất phải là số nguyên từ 1 đến 10'
      };
    }
    return { isValid: true };
  },

  /**
   * Comprehensive form validation before submission
   * @param {Object} values - Form values
   * @param {boolean} isConfirmed - Confirmation status
   * @returns {Object} Comprehensive validation result
   */
  validateFormSubmission(values, isConfirmed) {
    const errors = [];
    
    // Validate confirmation
    if (!this.validateConfirmation(isConfirmed)) {
      errors.push('Vui lòng xác nhận thông tin thuốc là chính xác');
    }
    
    // Validate student selection
    if (!this.validateStudentSelection(values.studentId)) {
      errors.push('Vui lòng chọn học sinh');
    }
    
    // Validate prescription images
    if (!this.validatePrescriptionImages(values.prescriptionImages)) {
      errors.push('Vui lòng tải lên ít nhất một ảnh đơn thuốc');
    }
    
    // Validate medication items
    if (!this.validateMedicationItems(values.itemRequests)) {
      errors.push('Vui lòng thêm ít nhất một loại thuốc');
    } else {
      // Validate time slots
      const timeSlotValidation = this.validateItemTimeSlots(values.itemRequests);
      if (!timeSlotValidation.isValid) {
        errors.push(...timeSlotValidation.errors);
      }
      
      // Validate schedule times consistency
      const scheduleValidation = this.validateScheduleTimesConsistency(values.itemRequests);
      if (!scheduleValidation.isValid) {
        errors.push(...scheduleValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Date utilities for medication management
 */
export const medicationDateUtils = {
  /**
   * Disable past dates in date picker
   * @param {dayjs.Dayjs} current - Current date being evaluated
   * @returns {boolean} Whether the date should be disabled
   */
  disabledDate(current) {
    // Disable all dates before today
    return current && current.isBefore(dayjs().startOf('day'));
  },

  /**
   * Get default date range for medication
   * @returns {Object} Default start and end dates
   */
  getDefaultDateRange() {
    return {
      startDate: dayjs(),
      endDate: dayjs().add(7, 'day')
    };
  },

  /**
   * Get default time slots based on frequency
   * @param {number} frequency - Number of times per day
   * @returns {Array} Array of default time slots
   */
  getDefaultTimeSlots(frequency) {
    const timeSlots = [];
    for (let i = 0; i < frequency; i++) {
      const defaultHour = i === 0 ? 8 : i === 1 ? 12 : i === 2 ? 18 : 8 + ((i * 4) % 24);
      timeSlots.push(dayjs().hour(defaultHour).minute(0));
    }
    return timeSlots;
  }
};
