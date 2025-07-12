import { Tag } from "antd";
import { formatDate as timeUtilsFormatDate } from "./timeUtils";

/**
 * Get status tag component for campaign status
 */
export const getStatusTag = (status) => {
  switch (status) {
    case "PENDING":
      return <Tag color="orange">Chưa duyệt</Tag>;
    case "APPROVED":
      return <Tag color="green">Đã duyệt</Tag>;
    case "REJECTED":
      return <Tag color="red">Đã từ chối</Tag>;
    case "IN_PROGRESS":
      return <Tag color="blue">Đang thực hiện</Tag>;
    case "COMPLETED":
      return <Tag color="purple">Đã hoàn thành</Tag>;
    case "CANCELLED":
      return <Tag color="gray">Đã hủy</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

/**
 * Get confirmation status tag component
 */
export const getConfirmationStatusTag = (status) => {
  switch (status) {
    case "PENDING":
      return <Tag color="orange">Chưa xác nhận</Tag>;
    case "CONFIRMED":
      return <Tag color="green">Đã xác nhận</Tag>;
    case "REJECTED":
      return <Tag color="red">Đã từ chối</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

/**
 * Get pre-vaccination status tag component
 */
export const getPreVaccinationStatusTag = (status) => {
  switch (status) {
    case "NORMAL":
      return <Tag color="green">Bình thường</Tag>;
    case "ABNORMAL":
      return <Tag color="red">Bất thường</Tag>;
    case "POSTPONED":
      return <Tag color="orange">Hoãn tiêm</Tag>;
    default:
      return <Tag color="default">{status || "Chưa kiểm tra"}</Tag>;
  }
};

/**
 * Get pre-vaccination status text
 */
export const getPreVaccinationStatusText = (status) => {
  switch (status) {
    case "NORMAL":
      return "Bình thường";
    case "ABNORMAL":
      return "Bất thường";
    case "POSTPONED":
      return "Hoãn tiêm";
    default:
      return status || "Chưa xác định";
  }
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date || date === "null" || date === "undefined") {
    return "Chưa có thông tin";
  }
  return timeUtilsFormatDate(date) || "Chưa có thông tin";
};

/**
 * Format sent date for vaccination forms
 */
export const formatSentDate = (date) => {
  if (!date || date === "null" || date === "undefined") {
    return "Chưa gửi";
  }
  return timeUtilsFormatDate(date) || "Chưa gửi";
};

/**
 * Calculate campaign statistics
 */
export const calculateCampaignStatistics = (forms, records) => {
  const confirmedForms = forms.filter(
    (form) => form.confirmationStatus === "CONFIRMED"
  ).length;
  
  const rejectedForms = forms.filter(
    (form) => form.confirmationStatus === "REJECTED"
  ).length;
  
  const pendingForms = forms.filter(
    (form) => form.confirmationStatus === "PENDING"
  ).length;
  
  const completedRecords = records.filter(
    (record) => record.preVaccinationStatus === "NORMAL"
  ).length;
  
  const postponedRecords = records.filter(
    (record) =>
      record.preVaccinationStatus === "ABNORMAL" ||
      record.preVaccinationStatus === "POSTPONED"
  ).length;

  return {
    confirmedForms,
    rejectedForms,
    pendingForms,
    completedRecords,
    postponedRecords,
  };
};

/**
 * Validate campaign permissions
 */
export const validateCampaignPermissions = (campaign) => {
  if (!campaign) {
    return {
      canEditCampaign: false,
      canGenerateForms: false,
      canSendForms: false,
      canCompleteCampaign: false,
      isCampaignCompleted: false,
    };
  }

  const canEditCampaign = campaign.status === "PENDING";
  const canGenerateForms = campaign.status === "APPROVED";
  const canSendForms = 
    (campaign.status === "APPROVED" || campaign.status === "IN_PROGRESS");
  const canCompleteCampaign = campaign.status === "IN_PROGRESS";
  const isCampaignCompleted = campaign.status === "COMPLETED";

  return {
    canEditCampaign,
    canGenerateForms,
    canSendForms,
    canCompleteCampaign,
    isCampaignCompleted,
  };
};

/**
 * Check if forms can be generated
 */
export const canGenerateFormsCheck = (campaign, forms) => {
  return campaign?.status === "APPROVED" && forms.length === 0;
};

/**
 * Check if forms can be sent
 */
export const canSendFormsCheck = (campaign, forms) => {
  return (
    (campaign?.status === "APPROVED" || campaign?.status === "IN_PROGRESS") &&
    forms.length > 0 &&
    forms.some((form) => !form.sentDate)
  );
};

/**
 * Clean notes for display (remove pre-vaccination status info)
 */
export const cleanNotesForDisplay = (notes, record) => {
  // For abnormal or postponed status, show the reason
  if (
    record.preVaccinationStatus === "ABNORMAL" ||
    record.preVaccinationStatus === "POSTPONED"
  ) {
    return record.preVaccinationNotes || "Không có lý do";
  }

  // For normal status, filter out pre-vaccination status info from notes
  if (notes) {
    const cleanNotes = notes
      .replace(/Pre-vaccination status: [^;]+;?\s*/g, "")
      .replace(/^\s*;\s*/, "") // Remove leading semicolon
      .trim();

    return cleanNotes || "Không có";
  }

  return "Không có";
};

/**
 * Get current notes for editing form
 */
export const getCurrentNotesForEditing = (record) => {
  // Get current notes based on status
  if (
    record.preVaccinationStatus === "ABNORMAL" ||
    record.preVaccinationStatus === "POSTPONED"
  ) {
    return record.preVaccinationNotes || "";
  }

  // Filter out preVaccinationStatus from notes to get actual notes
  if (record.notes) {
    const cleanNotes = record.notes
      .replace(/Pre-vaccination status: [^;]+;?\s*/g, "")
      .replace(/^\s*;\s*/, "")
      .trim();
    return cleanNotes || "";
  }

  return "";
};