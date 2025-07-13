import dayjs from "dayjs";

/**
 * Validation utility for vaccination campaign form
 * Contains all validation rules and logic for the VaccinationCampaignForm component
 */
export const vaccinationCampaignValidation = {
  /**
   * Validate campaign name
   * @param {Object} rule - Ant Design validation rule
   * @param {string} value - Input value
   * @returns {Promise} Validation result
   */
  validateCampaignName: (rule, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error("Vui lòng nhập tên chiến dịch"));
    }
    return Promise.resolve();
  },

  /**
   * Validate vaccination rule selection
   * @param {Object} rule - Ant Design validation rule
   * @param {any} value - Selected rule ID
   * @returns {Promise} Validation result
   */
  validateVaccinationRule: (rule, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn quy tắc tiêm chủng"));
    }
    return Promise.resolve();
  },

  /**
   * Validate scheduled date
   * @param {Object} rule - Ant Design validation rule
   * @param {dayjs.Dayjs} value - Selected date
   * @returns {Promise} Validation result
   */
  validateScheduledDate: (rule, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày thực hiện"));
    }

    const today = dayjs();

    // Check if the scheduled date is in the future (after today)
    if (value.isBefore(today, "day") || value.isSame(today, "day")) {
      return Promise.reject(new Error("Ngày thực hiện phải là ngày tương lai"));
    }

    // Business rule: Campaign date must be at least 4 days from creation
    const minimumDate = today.add(4, "day");
    if (value.isBefore(minimumDate, "day")) {
      return Promise.reject(
        new Error(`Ngày tiêm phải cách ít nhất 4 ngày từ hôm nay (tối thiểu: ${minimumDate.format("DD/MM/YYYY")})`)
      );
    }

    return Promise.resolve();
  },

  /**
   * Validate location
   * @param {Object} rule - Ant Design validation rule
   * @param {string} value - Location value
   * @returns {Promise} Validation result
   */
  validateLocation: (rule, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error("Vui lòng nhập địa điểm"));
    }
    return Promise.resolve();
  },

  /**
   * Validate estimated vaccine count
   * @param {Object} rule - Ant Design validation rule
   * @param {number} value - Vaccine count
   * @returns {Promise} Validation result
   */
  validateVaccineCount: (rule, value) => {
    if (value === null || value === undefined) {
      return Promise.reject(
        new Error("Vui lòng chọn quy tắc tiêm chủng để tính toán số lượng vaccine")
      );
    }
    if (value < 0) {
      return Promise.reject(
        new Error("Số lượng vaccine phải lớn hơn hoặc bằng 0")
      );
    }
    return Promise.resolve();
  },

  /**
   * Validate campaign description
   * @param {Object} rule - Ant Design validation rule
   * @param {string} value - Description value
   * @returns {Promise} Validation result
   */
  validateDescription: (rule, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error("Vui lòng nhập mô tả"));
    }
    return Promise.resolve();
  },

  /**
   * Validate pre/post care instructions
   * @param {Object} rule - Ant Design validation rule
   * @param {string} value - Instructions value
   * @returns {Promise} Validation result
   */
  validateCareInstructions: (rule, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error("Vui lòng nhập hướng dẫn chăm sóc"));
    }
    return Promise.resolve();
  },

  /**
   * Check if a date is disabled for date picker
   * @param {dayjs.Dayjs} current - Current date being checked
   * @returns {boolean} True if date should be disabled
   */
  isDateDisabled: (current) => {
    if (!current) return false;
    
    const today = dayjs();
    const minimumDate = today.add(4, "day");
    
    // Disable all dates before the minimum required date (4 days from today)
    return current.isBefore(minimumDate, "day");
  },

  /**
   * Get all form validation rules
   * @returns {Object} Object containing all validation rules for form fields
   */
  getFormValidationRules: () => ({
    name: [
      { required: true, validator: vaccinationCampaignValidation.validateCampaignName },
    ],
    vaccinationRuleId: [
      { required: true, validator: vaccinationCampaignValidation.validateVaccinationRule },
    ],
    scheduledDate: [
      { required: true, validator: vaccinationCampaignValidation.validateScheduledDate },
    ],
    location: [
      { required: true, validator: vaccinationCampaignValidation.validateLocation },
    ],
    estimatedVaccineCount: [
      { required: true, validator: vaccinationCampaignValidation.validateVaccineCount },
      { type: "number", min: 0, message: "Số lượng vaccine phải lớn hơn hoặc bằng 0" },
    ],
    description: [
      { required: true, validator: vaccinationCampaignValidation.validateDescription },
    ],
    prePostCareInstructions: [
      { required: true, validator: vaccinationCampaignValidation.validateCareInstructions },
    ],
  }),
};
