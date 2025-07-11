import React from "react";
import { Button } from "antd";
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

/**
 * Shared component for editing user profile fields
 * Supports role-based theming and customizable field display
 */
const UserProfileEditForm = ({
  formData,
  errors = {},
  onChange,
  onSubmit,
  loading = false,
  role = "default", // parent, admin, manager, nurse
  showFields = {
    firstName: true,
    lastName: true,
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
  customPlaceholders = {},
  requiredFields = [],
  onCancel,
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

  // Default field labels
  const defaultLabels = {
    firstName: "Tên",
    lastName: "Họ",
    email: "Email",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    dateOfBirth: "Ngày sinh",
    gender: "Giới tính",
    jobTitle: "Chức vụ",
    emergencyContact: "Liên hệ khẩn cấp",
    relationship: "Quan hệ",
  };

  // Default placeholders
  const defaultPlaceholders = {
    firstName: "Nhập tên",
    lastName: "Nhập họ",
    email: "example@email.com",
    phone: "0123456789",
    address: "Nhập địa chỉ",
    dateOfBirth: "",
    jobTitle: "Nhập chức vụ",
    emergencyContact: "0123456789",
    relationship: "Chọn quan hệ",
  };

  // Merge custom labels and placeholders with defaults
  const labels = { ...defaultLabels, ...customLabels };
  const placeholders = { ...defaultPlaceholders, ...customPlaceholders };

  // Helper function to create label with icon
  const createLabel = (icon, text, required = false) => (
    <label className="profile-form-label">
      {React.cloneElement(icon, { 
        style: { marginRight: 8, color: themeColor } 
      })}
      {text}
      {required && <span style={{ color: "#ff4d4f" }}> *</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className={`user-profile-edit-form ${className}`}>
      <div className="profile-form-grid">
        {/* Last Name */}
        {showFields.lastName && (
          <div className="profile-form-group">
            {createLabel(<UserOutlined />, labels.lastName, requiredFields.includes('lastName'))}
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={onChange}
              placeholder={placeholders.lastName}
              className={errors.lastName ? "error" : ""}
              required
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}
          </div>
        )}
        
        {/* First Name */}
        {showFields.firstName && (
          <div className="profile-form-group">
            {createLabel(<UserOutlined />, labels.firstName, requiredFields.includes('firstName'))}
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={onChange}
              placeholder={placeholders.firstName}
              className={errors.firstName ? "error" : ""}
              required
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}
          </div>
        )}

        {/* Email */}
        {showFields.email && (
          <div className="profile-form-group">
            {createLabel(<MailOutlined />, labels.email, requiredFields.includes('email'))}
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={onChange}
              placeholder={placeholders.email}
              className={errors.email ? "error" : ""}
              required
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>
        )}
        
        {/* Phone */}
        {showFields.phone && (
          <div className="profile-form-group">
            {createLabel(<PhoneOutlined />, labels.phone, requiredFields.includes('phone'))}
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={onChange}
              placeholder={placeholders.phone}
              className={errors.phone ? "error" : ""}
              required
            />
            {errors.phone && (
              <span className="error-text">{errors.phone}</span>
            )}
          </div>
        )}

        {/* Date of Birth */}
        {showFields.dateOfBirth && (
          <div className="profile-form-group">
            {createLabel(<CalendarOutlined />, labels.dateOfBirth, requiredFields.includes('dateOfBirth'))}
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={onChange}
              className={errors.dateOfBirth ? "error" : ""}
            />
            {errors.dateOfBirth && (
              <span className="error-text">{errors.dateOfBirth}</span>
            )}
          </div>
        )}
        
        {/* Gender */}
        {showFields.gender && (
          <div className="profile-form-group">
            {createLabel(<UserOutlined />, labels.gender, requiredFields.includes('gender'))}
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={onChange}
              className={errors.gender ? "error" : ""}
            >
              <option value="">Chọn giới tính</option>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
            </select>
            {errors.gender && (
              <span className="error-text">{errors.gender}</span>
            )}
          </div>
        )}

        {/* Job Title */}
        {showFields.jobTitle && (
          <div className="profile-form-group">
            {createLabel(<BankOutlined />, labels.jobTitle, requiredFields.includes('jobTitle'))}
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle || ""}
              onChange={onChange}
              placeholder={placeholders.jobTitle}
              className={errors.jobTitle ? "error" : ""}
            />
            {errors.jobTitle && (
              <span className="error-text">{errors.jobTitle}</span>
            )}
          </div>
        )}
        

        {/* Address */}
        {showFields.address && (
          <div className="profile-form-group">
            {createLabel(<HomeOutlined />, labels.address, requiredFields.includes('address'))}
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={onChange}
              placeholder={placeholders.address}
              className={errors.address ? "error" : ""}
            />
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="profile-form-actions">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          style={{ backgroundColor: themeColor, borderColor: themeColor }}
        >
          Lưu thay đổi
        </Button>
        {onCancel && (
          <Button
            type="default"
            onClick={onCancel}
            size="large"
          >
            Hủy
          </Button>
        )}
      </div>
    </form>
  );
};

export default UserProfileEditForm;
