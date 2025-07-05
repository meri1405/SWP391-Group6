import { Tag } from "antd";
import {
  STATUS,
  FORM_STATUS,
  HEALTH_PROFILE_STATUS,
  MEDICATION_STATUS,
  COLORS,
} from "../constants";

/**
 * Get status tag for general status
 */
export const getStatusTag = (status) => {
  const statusConfig = {
    [STATUS.PENDING]: { color: "orange", text: "Chờ xử lý" },
    [STATUS.APPROVED]: { color: "green", text: "Đã duyệt" },
    [STATUS.REJECTED]: { color: "red", text: "Từ chối" },
    [STATUS.CONFIRMED]: { color: "blue", text: "Đã xác nhận" },
    [STATUS.DECLINED]: { color: "volcano", text: "Từ chối" },
    [STATUS.COMPLETED]: { color: "green", text: "Hoàn thành" },
    [STATUS.CANCELLED]: { color: "gray", text: "Đã hủy" },
    [STATUS.ACTIVE]: { color: "green", text: "Hoạt động" },
    [STATUS.INACTIVE]: { color: "gray", text: "Không hoạt động" },
  };

  const config = statusConfig[status] || { color: "default", text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

/**
 * Get form status tag
 */
export const getFormStatusTag = (status) => {
  const statusConfig = {
    [FORM_STATUS.PENDING]: { color: "orange", text: "Chờ phản hồi" },
    [FORM_STATUS.CONFIRMED]: { color: "green", text: "Đã xác nhận" },
    [FORM_STATUS.DECLINED]: { color: "red", text: "Từ chối" },
    [FORM_STATUS.NO_FORM]: { color: "gray", text: "Chưa có phiếu" },
    [FORM_STATUS.COMPLETED]: { color: "blue", text: "Hoàn thành" },
    [FORM_STATUS.CANCELED]: { color: "gray", text: "Đã hủy" },
  };

  const config = statusConfig[status] || { color: "default", text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

/**
 * Get health profile status tag
 */
export const getHealthProfileStatusTag = (status) => {
  const statusConfig = {
    [HEALTH_PROFILE_STATUS.PENDING]: { color: "orange", text: "Chờ duyệt" },
    [HEALTH_PROFILE_STATUS.APPROVED]: { color: "green", text: "Đã duyệt" },
    [HEALTH_PROFILE_STATUS.REJECTED]: { color: "red", text: "Từ chối" },
    [HEALTH_PROFILE_STATUS.COMPLETED]: { color: "blue", text: "Hoàn thành" },
  };

  const config = statusConfig[status] || { color: "default", text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

/**
 * Get medication status tag
 */
export const getMedicationStatusTag = (status) => {
  const statusConfig = {
    [MEDICATION_STATUS.PENDING]: { color: "orange", text: "Chờ duyệt" },
    [MEDICATION_STATUS.APPROVED]: { color: "green", text: "Đã duyệt" },
    [MEDICATION_STATUS.REJECTED]: { color: "red", text: "Từ chối" },
    [MEDICATION_STATUS.COMPLETED]: { color: "blue", text: "Hoàn thành" },
  };

  const config = statusConfig[status] || { color: "default", text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colorMap = {
    [STATUS.PENDING]: COLORS.WARNING,
    [STATUS.APPROVED]: COLORS.SUCCESS,
    [STATUS.REJECTED]: COLORS.ERROR,
    [STATUS.CONFIRMED]: COLORS.PRIMARY,
    [STATUS.DECLINED]: COLORS.ERROR,
    [STATUS.COMPLETED]: COLORS.SUCCESS,
    [STATUS.CANCELLED]: COLORS.GRAY,
    [STATUS.ACTIVE]: COLORS.SUCCESS,
    [STATUS.INACTIVE]: COLORS.GRAY,
  };

  return colorMap[status] || COLORS.GRAY;
};

/**
 * Get Vietnamese status text
 */
export const getStatusText = (status) => {
  const textMap = {
    [STATUS.PENDING]: "Chờ xử lý",
    [STATUS.APPROVED]: "Đã duyệt",
    [STATUS.REJECTED]: "Từ chối",
    [STATUS.CONFIRMED]: "Đã xác nhận",
    [STATUS.DECLINED]: "Từ chối",
    [STATUS.COMPLETED]: "Hoàn thành",
    [STATUS.CANCELLED]: "Đã hủy",
    [STATUS.ACTIVE]: "Hoạt động",
    [STATUS.INACTIVE]: "Không hoạt động",
  };

  return textMap[status] || status;
};

/**
 * Check if status is editable
 */
export const isStatusEditable = (status) => {
  const editableStatuses = [
    STATUS.PENDING,
    FORM_STATUS.PENDING,
    HEALTH_PROFILE_STATUS.PENDING,
  ];
  return editableStatuses.includes(status);
};

/**
 * Check if status is final (cannot be changed)
 */
export const isStatusFinal = (status) => {
  const finalStatuses = [
    STATUS.COMPLETED,
    STATUS.CANCELLED,
    FORM_STATUS.COMPLETED,
    FORM_STATUS.CANCELED,
    HEALTH_PROFILE_STATUS.COMPLETED,
  ];
  return finalStatuses.includes(status);
};
