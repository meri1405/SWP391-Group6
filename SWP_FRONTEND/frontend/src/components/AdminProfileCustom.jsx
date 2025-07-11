import React from "react";
import { Card, Button, Spin } from "antd";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "./common";
import { useProfileEditLogic } from "../hooks/useProfileEditLogic";
import { adminProfileConfig } from "../hooks/profileConfigs";
import "../styles/AdminProfileCustom.css";
import "../styles/SharedProfile.css";

const AdminProfileCustom = ({ userInfo: initialUserInfo, onProfileUpdate }) => {
  // Use the profile edit logic hook with admin configuration
  const {
    isEditing,
    loading,
    formData,
    errors,
    requiredFields,
    handleChange,
    handleSubmit,
    toggleEditMode,
  } = useProfileEditLogic({
    ...adminProfileConfig,
    initialData: initialUserInfo,
    onProfileUpdate,
  });

  // Show loading spinner while fetching data
  if (loading && !formData.firstName) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spin size="large" />
        <span style={{ marginLeft: "16px" }}>Đang tải thông tin admin...</span>
      </div>
    );
  }

  return (
    <div className="admin-profile-custom-container">
      <div className="admin-profile-custom-header">
        <div className="admin-header-content">
          <h2>
            <UserOutlined /> Hồ Sơ Cá Nhân
          </h2>
          <p>Quản lý thông tin tài khoản quản trị viên</p>
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

      <div className="admin-profile-custom-content">
        <Card
          className="admin-profile-custom-card"
          title={<div className="admin-card-title">Thông tin cá nhân</div>}
          styles={{
            body: { padding: "24px" },
            header: {
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            },
          }}
        >
          <div className="admin-profile-combined-section">
            <div className="admin-profile-avatar-section">
              <UserProfileAvatar 
                profileData={formData}
                role="admin"
                avatarSize={72}
                showRole={true}
                customRoleDisplay="Quản trị viên"
              />
              {isEditing && (
                <Button icon={<EditOutlined />} size="small" disabled>
                  Đổi ảnh
                </Button>
              )}
            </div>

            {!isEditing && (
              <div className="admin-profile-info-grid">
                <UserProfileDetails
                  profileData={formData}
                  role="admin"
                  showFields={{
                    name: true,
                    username: true,
                    email: true,
                    phone: true,
                    address: true,
                    dateOfBirth: true,
                    gender: true,
                    jobTitle: true,
                  }}
                  customLabels={{
                    name: "HỌ VÀ TÊN",
                    username: "TÊN ĐĂNG NHẬP",
                    email: "EMAIL",
                    phone: "SỐ ĐIỆN THOẠI",
                    address: "ĐỊA CHỈ",
                    dateOfBirth: "NGÀY SINH",
                    gender: "GIỚI TÍNH",
                    jobTitle: "CHỨC VỤ",
                  }}
                  customFormatters={{
                    dateOfBirth: (value) => {
                      if (!value) return "Chưa cập nhật";
                      try {
                        return new Date(value).toLocaleDateString("vi-VN");
                      } catch {
                        return "Chưa cập nhật";
                      }
                    }
                  }}
                  className="admin-profile-details"
                />
              </div>
            )}
          </div>

          {isEditing && (
            <UserProfileEditForm
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              role="admin"
              requiredFields={requiredFields}
              showFields={{
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true,
                dateOfBirth: true,
                gender: true,
                jobTitle: true,
              }}
              customLabels={{
                firstName: "Tên",
                lastName: "Họ",
                email: "Email",
                phone: "Số điện thoại",
                address: "Địa chỉ",
                dateOfBirth: "Ngày sinh",
                gender: "Giới tính",
                jobTitle: "Chức vụ",
              }}
              customPlaceholders={{
                email: "admin@example.com",
                phone: "0123456789",
              }}
              onCancel={toggleEditMode}
              className="admin-profile-edit-form"
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminProfileCustom;
