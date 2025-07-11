import React from "react";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  IdcardOutlined,
  BankOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

/**
 * Shared component for displaying common user profile fields
 * Supports role-based theming and customizable field display
 */
const UserProfileDetails = ({
  profileData,
  role = "default", // parent, admin, manager, nurse
  showFields = {
    name: true,
    username: true,
    email: true,
    phone: true,
    address: true,
    dateOfBirth: true,
    gender: true,
    jobTitle: true,
    emergencyContact: false,
    relationship: false,
  },
  customLabels = {},
  customFormatters = {},
  className = "",
}) => {
  // Role-based theme colors
  const roleColors = {
    parent: "#1890ff", // Blue
    admin: "#faad14", // Yellow
    manager: "#ff4d4f", // Red
    nurse: "#52c41a", // Green
    default: "#666666", // Gray
  };

  const themeColor = roleColors[role] || roleColors.default;

  // Default formatters for common data types
  const defaultFormatters = {
    dateOfBirth: (value) => {
      if (!value) return "Chưa cập nhật";
      
      // Handle different date formats
      if (Array.isArray(value)) {
        // Java LocalDate array format: [year, month, day]
        try {
          const [year, month, day] = value;
          return dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`).format("DD/MM/YYYY");
        } catch (error) {
          console.error("Error formatting date array:", value, error);
          return "Chưa cập nhật";
        }
      }
      
      // Handle string dates
      try {
        return dayjs(value).format("DD/MM/YYYY");
      } catch {
        return "Chưa cập nhật";
      }
    },
    gender: (value) => {
      if (!value) return "Chưa cập nhật";
      switch (value.toUpperCase()) {
        case "M":
          return "Nam";
        case "F":
          return "Nữ";
        case "O":
          return "Khác";
        default:
          return value;
      }
    },
    phone: (value) => {
      if (!value) return "Chưa cập nhật";
      // Format phone number
      const cleanPhone = value.replace(/\D/g, "");
      if (cleanPhone.length === 10) {
        return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
      }
      return value;
    },
    name: (firstName, lastName) => {
      if (!firstName && !lastName) return "Chưa cập nhật";
      return `${lastName || ""} ${firstName || ""}`.trim();
    }
  };

  // Merge custom formatters with defaults
  const formatters = { ...defaultFormatters, ...customFormatters };

  // Default field labels
  const defaultLabels = {
    name: "Họ và tên",
    username: "Tên đăng nhập", 
    email: "Email",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    dateOfBirth: "Ngày sinh",
    gender: "Giới tính",
    jobTitle: "Chức vụ",
    emergencyContact: "Liên hệ khẩn cấp",
    relationship: "Quan hệ",
  };

  // Merge custom labels with defaults
  const labels = { ...defaultLabels, ...customLabels };

  // Helper function to create label with icon
  const createLabel = (icon, text) => (
    <label className="profile-form-label">
      {React.cloneElement(icon, { 
        style: { marginRight: 8, color: themeColor } 
      })}
      {text}
    </label>
  );

  // Helper function to get field value with formatter
  const getFieldValue = (fieldName, value, ...additionalArgs) => {
    if (formatters[fieldName]) {
      return formatters[fieldName](value, ...additionalArgs);
    }
    return value || "Chưa cập nhật";
  };

  return (
    <div className={`user-profile-view-form ${className}`}>
      <div className="profile-form-grid">
        {/* Name */}
        {showFields.name && (
          <div className="profile-form-group">
            {createLabel(<UserOutlined />, labels.name)}
            <div className="profile-display-field">
              {getFieldValue("name", profileData?.firstName, profileData?.lastName)}
            </div>
          </div>
        )}

        {/* Username */}
        {showFields.username && profileData?.username && (
          <div className="profile-form-group">
            {createLabel(<IdcardOutlined />, labels.username)}
            <div className="profile-display-field">
              {profileData.username}
            </div>
          </div>
        )}

        {/* Email */}
        {showFields.email && (
          <div className="profile-form-group">
            {createLabel(<MailOutlined />, labels.email)}
            <div className="profile-display-field">
              {profileData?.email || "Chưa cập nhật"}
            </div>
          </div>
        )}

        {/* Phone */}
        {showFields.phone && (
          <div className="profile-form-group">
            {createLabel(<PhoneOutlined />, labels.phone)}
            <div className="profile-display-field">
              {getFieldValue("phone", profileData?.phone)}
            </div>
          </div>
        )}

        {/* Date of Birth */}
        {showFields.dateOfBirth && (
          <div className="profile-form-group">
            {createLabel(<CalendarOutlined />, labels.dateOfBirth)}
            <div className="profile-display-field">
              {getFieldValue("dateOfBirth", profileData?.dateOfBirth || profileData?.dob)}
            </div>
          </div>
        )}

        {/* Gender */}
        {showFields.gender && (
          <div className="profile-form-group">
            {createLabel(<UserOutlined />, labels.gender)}
            <div className="profile-display-field">
              {getFieldValue("gender", profileData?.gender)}
            </div>
          </div>
        )}

        {/* Job Title */}
        {showFields.jobTitle && (
          <div className="profile-form-group">
            {createLabel(<BankOutlined />, labels.jobTitle)}
            <div className="profile-display-field">
              {profileData?.jobTitle || profileData?.specialization || "Chưa cập nhật"}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {showFields.emergencyContact && (
          <div className="profile-form-group">
            {createLabel(<PhoneOutlined />, labels.emergencyContact)}
            <div className="profile-display-field">
              {getFieldValue("phone", profileData?.emergencyContact)}
            </div>
          </div>
        )}

        {/* Relationship */}
        {showFields.relationship && (
          <div className="profile-form-group">
            {createLabel(<TeamOutlined />, labels.relationship)}
            <div className="profile-display-field">
              {profileData?.relationship || "Chưa cập nhật"}
            </div>
          </div>
        )}

        {/* Address */}
        {showFields.address && (
          <div className="profile-form-group">
            {createLabel(<HomeOutlined />, labels.address)}
            <div className="profile-display-field">
              {profileData?.address || "Chưa cập nhật"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileDetails;
