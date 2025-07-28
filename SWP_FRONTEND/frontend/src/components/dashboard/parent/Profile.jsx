import React from "react";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
} from "antd";
import { useAuth } from "../../../contexts/AuthContext";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "../../common";
import { useProfileEditLogic } from "../../../hooks/useProfileEditLogic";
import { createParentProfileConfig } from "../../../hooks/profileConfigs";
import "../../../styles/Profile.css";
import "../../../styles/SharedProfile.css";
import dayjs from 'dayjs';

const Profile = ({ userInfo, onProfileUpdate }) => {
  const { getToken } = useAuth();
  
  // Debug: Log userInfo received
  console.log('Profile component received userInfo:', userInfo);
  
  // Use the profile edit logic hook with parent configuration
  const parentConfig = createParentProfileConfig(getToken());
  const {
    isEditing,
    formData,
    errors,
    requiredFields,
    handleChange,
    handleSubmit,
    toggleEditMode,
    loading,
  } = useProfileEditLogic({
    ...parentConfig,
    fetchProfile: null, // Disable automatic fetching since we have userInfo
    initialData: userInfo,
    onProfileUpdate,
  });

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h2>
            <UserOutlined /> Hồ Sơ Cá Nhân
          </h2>
          <p>Quản lý thông tin cá nhân và gia đình</p>
        </div>
        <Button
          type={isEditing ? "default" : "primary"}
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={toggleEditMode}
          size="large"
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>
      <div className="profile-content">
        <Card
          className="profile-main-card"
          title="Thông tin cá nhân"
          styles={{ body: { padding: "24px" } }}
        >
          <div className="profile-avatar-section">
            <UserProfileAvatar 
              profileData={formData}
              role="parent"
              avatarSize={120}
              showRole={true}
              customRoleDisplay="Phụ Huynh"
            />
          </div>

          {isEditing ? (
            <UserProfileEditForm
              formData={formData}
              errors={errors}
              requiredFields={requiredFields}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              role="parent"
              showFields={{
                firstName: true,
                lastName: true,
                phone: true,
                address: true,
                dateOfBirth: true,
                jobTitle: true,
              }}
              customLabels={{
                firstName: "Tên",
                lastName: "Họ",
                phone: "Số điện thoại",
                address: "Địa chỉ",
                dateOfBirth: "Ngày sinh",
                jobTitle: "Nghề nghiệp",
              }}
              onCancel={toggleEditMode}
              className="parent-profile-edit-form"
            />
          ) : (
            <UserProfileDetails
              profileData={formData}
              role="parent"
              showFields={{
                name: true,
                phone: true,
                dateOfBirth: true,
                jobTitle: true,
                address: true,
              }}
              customLabels={{
                name: "Họ và tên",
                phone: "Số điện thoại",
                dateOfBirth: "Ngày sinh",
                jobTitle: "Nghề nghiệp",
                address: "Địa chỉ",
              }}
              customFormatters={{
                dateOfBirth: (value) => {
                  if (!value) return "N/A";
                  try {
                    return dayjs(value).format("DD/MM/YYYY");
                  } catch {
                    return "N/A";
                  }
                },
                jobTitle: (value) => value || "PARENT",
                address: (value) => value || "123 Healthcare Ave",
              }}
              className="parent-profile-details"
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
