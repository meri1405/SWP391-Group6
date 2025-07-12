/**
 * Utility functions for vaccination rule management
 */

/**
 * Format age from months to a readable string
 * @param {number} months - Age in months
 * @returns {string} Formatted age string
 */
export const formatAge = (months) => {
  if (months < 12) {
    return `${months} tháng`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} tuổi`;
    } else {
      return `${years} tuổi ${remainingMonths} tháng`;
    }
  }
};

/**
 * Validation rules for the vaccination rule form
 */
export const getFormValidationRules = () => ({
  name: [
    { required: true, message: "Vui lòng nhập tên quy tắc" },
    {
      max: 255,
      message: "Tên quy tắc không được vượt quá 255 ký tự",
    },
  ],
  description: [
    { required: true, message: "Vui lòng nhập mô tả" },
    { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
  ],
  doesNumber: [
    {
      required: true,
      message: "Vui lòng nhập số thứ tự mũi tiêm",
    },
    {
      type: "number",
      min: 1,
      max: 10,
      message: "Mũi tiêm phải từ 1-10",
    },
  ],
  intervalDays: (currentDoseNumber) => [
    {
      required: currentDoseNumber !== 1,
      message: "Vui lòng nhập số ngày tối thiểu",
    },
    {
      type: "number",
      min: 0,
      max: 365,
      message: "Số ngày phải từ 0-365 ngày",
    },
  ],
  minAge: [
    { required: true, message: "Vui lòng nhập tuổi tối thiểu" },
    {
      type: "number",
      min: 0,
      max: 216,
      message: "Tuổi phải từ 0-216 tháng (18 năm)",
    },
  ],
  maxAge: [
    { required: true, message: "Vui lòng nhập tuổi tối đa" },
    {
      type: "number",
      min: 0,
      max: 216,
      message: "Tuổi phải từ 0-216 tháng (18 năm)",
    },
  ],
});

/**
 * Get empty form values to clear the form
 * @returns {Object} Object with all fields set to undefined
 */
export const getEmptyFormValues = () => ({
  name: undefined,
  description: undefined,
  doesNumber: undefined,
  minAge: undefined,
  maxAge: undefined,
  intervalDays: undefined,
  mandatory: undefined,
});

/**
 * Calculate statistics from vaccination rules
 * @param {Array} rules - Array of vaccination rules
 * @returns {Object} Statistics object
 */
export const calculateRuleStatistics = (rules) => ({
  total: rules.length,
  mandatory: rules.filter((rule) => rule.mandatory).length,
  optional: rules.filter((rule) => !rule.mandatory).length,
});
