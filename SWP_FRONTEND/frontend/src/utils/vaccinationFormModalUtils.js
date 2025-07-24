/**
 * Utility functions for vaccination form modal
 * Handles formatting, validation, and data transformation
 */

/**
 * Format gender display text
 * @param {string} gender - Raw gender value
 * @returns {string} Formatted gender text
 */
export const formatGender = (gender) => {
  if (!gender) return "Không có thông tin";

  switch (gender.toLowerCase()) {
    case 'M':
    case "nam":
      return "Nam";
    case 'F':
    case "nữ":
      return "Nữ";
    default:
      return gender;
  }
};

/**
 * Get status color based on confirmation status
 * @param {string} status - Confirmation status
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "#52c41a";
    case "DECLINED":
      return "#ff4d4f";
    case "PENDING":
      return "#faad14";
    case "EXPIRED":
      return "#8c8c8c";
    default:
      return "#d9d9d9";
  }
};

/**
 * Get localized status text
 * @param {string} status - Confirmation status
 * @returns {string} Vietnamese status text
 */
export const getStatusText = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "Đã xác nhận";
    case "DECLINED":
      return "Đã từ chối";
    case "PENDING":
      return "Chờ xác nhận";
    case "EXPIRED":
      return "Đã hết hạn";
    default:
      return status;
  }
};

/**
 * Validate if decline action requires notes
 * @param {string} action - The action type ('confirm' or 'decline')
 * @param {string} notes - The notes text
 * @returns {boolean} Whether the form is valid for submission
 */
export const validateFormSubmission = (action, notes) => {
  if (action === "decline") {
    return notes && notes.trim().length > 0;
  }
  return true; // Confirm action doesn't require notes
};

/**
 * Get confirmation dialog title based on action
 * @param {string} action - The action type ('confirm' or 'decline')
 * @returns {string} Dialog title
 */
export const getConfirmationDialogTitle = (action) => {
  return action === "confirm" ? "Xác nhận đồng ý" : "Xác nhận từ chối";
};

/**
 * Get confirmation dialog message
 * @param {string} action - The action type ('confirm' or 'decline')
 * @param {string} vaccineName - Name of the vaccine
 * @returns {string} Dialog message
 */
export const getConfirmationDialogMessage = (action, vaccineName) => {
  const actionText = action === "confirm" ? "đồng ý cho con tiêm" : "từ chối cho con tiêm";
  return `Bạn có chắc chắn muốn ${actionText} vắc xin ${vaccineName}?`;
};

/**
 * Get notes placeholder text based on action
 * @param {string} action - The action type ('confirm' or 'decline')
 * @returns {string} Placeholder text
 */
export const getNotesPlaceholder = (action) => {
  return action === "confirm"
    ? "Ghi chú thêm (nếu có)..."
    : "Vui lòng ghi rõ lý do từ chối...";
};

/**
 * Get notes label based on action
 * @param {string} action - The action type ('confirm' or 'decline')
 * @returns {string} Label text
 */
export const getNotesLabel = (action) => {
  const requirement = action === "decline" ? "(bắt buộc)" : "(tùy chọn)";
  return `Ghi chú ${requirement}:`;
};

/**
 * Check if the form can be modified (status is PENDING)
 * @param {string} status - Current form status
 * @returns {boolean} Whether the form can be modified
 */
export const canModifyForm = (status) => {
  return status === "PENDING";
};
