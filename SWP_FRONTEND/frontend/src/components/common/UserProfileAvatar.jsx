import React from "react";
import { Avatar, Typography, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

/**
 * Shared component for displaying user avatar and basic info
 * Supports role-based theming
 */
const UserProfileAvatar = ({
  profileData,
  role = "default", // parent, admin, manager, nurse
  avatarSize = 120,
  showRole = true,
  customRoleDisplay = null,
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

  // Role display names
  const roleDisplayNames = {
    parent: "Phụ huynh",
    admin: "Quản trị viên", 
    manager: "Quản lý",
    nurse: "Y tá trường học",
    MANAGER: "Quản lý",
    ADMIN: "Quản trị viên",
    PARENT: "Phụ huynh",
    NURSE: "Y tá trường học",
  };

  const themeColor = roleColors[role] || roleColors.default;
  
  // Get display name
  const getDisplayName = () => {
    if (!profileData?.firstName && !profileData?.lastName) {
      return profileData?.fullName || profileData?.username || "Người dùng";
    }
    return `${profileData?.lastName || ""} ${profileData?.firstName || ""}`.trim();
  };

  // Get role display
  const getRoleDisplay = () => {
    if (customRoleDisplay) return customRoleDisplay;
    
    const userRole = profileData?.roleName || profileData?.jobTitle || role;
    return roleDisplayNames[userRole] || userRole || "Người dùng";
  };

  return (
    <div className={`user-profile-avatar ${className}`} style={{ textAlign: "center" }}>
      <Avatar
        size={avatarSize}
        src={profileData?.avatar}
        icon={<UserOutlined />}
        style={{
          backgroundColor: themeColor,
          marginBottom: 16,
          border: "4px solid #fff",
          boxShadow: `0 4px 16px ${themeColor}33`,
        }}
      />
      
      <Title level={3} style={{ margin: "16px 0 8px 0", color: "#333" }}>
        {getDisplayName()}
      </Title>
      
      {showRole && (
        <Tag
          style={{
            fontSize: 14,
            padding: "4px 12px",
            borderRadius: 20,
            marginBottom: 16,
            backgroundColor: `${themeColor}15`,
            color: themeColor,
            border: `1px solid ${themeColor}50`,
          }}
        >
          {getRoleDisplay()}
        </Tag>
      )}
    </div>
  );
};

export default UserProfileAvatar;
