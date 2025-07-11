import React from "react";
import { Card, Button, Tag, Spin } from "antd";
import {
  EditOutlined,
  CloseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "../common";
import { useProfileEditLogic } from "../../hooks/useProfileEditLogic";
import { managerProfileConfig } from "../../hooks/profileConfigs";
import "../../styles/ProfileSection.css";
import "../../styles/SharedProfile.css";

const ManagerProfile = () => {
  // Use the profile edit logic hook with manager configuration
  const {
    isEditing,
    loading,
    profileData: profile,
    formData,
    errors,
    requiredFields,
    handleChange,
    handleSubmit,
    toggleEditMode,
  } = useProfileEditLogic(managerProfileConfig);

  // Helper function to convert Java date array (keep this for system info display)
  const convertJavaDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return null;
    try {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
      return dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error("Error converting date array:", dateArray, error);
      return null;
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" />
        <span style={{ marginLeft: "16px" }}>Đang tải thông tin quản lý...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <span>Không thể tải thông tin hồ sơ</span>
      </div>
    );
  }

  return (
    <div className="manager-profile-container">
      <div className="manager-profile-header">
        <div className="manager-header-content">
          <h2>
            <TeamOutlined style={{ color: "#ff4d4f" }} /> Hồ Sơ Cá Nhân
          </h2>
          <p>Quản lý thông tin tài khoản quản lý</p>
        </div>
        <Button
          type={isEditing ? "default" : "primary"}
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={toggleEditMode}
          size="large"
          style={{
            backgroundColor: isEditing ? undefined : "#ff4d4f",
            borderColor: isEditing ? undefined : "#ff4d4f"
          }}
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      <div className="manager-profile-content">
        <Card
          className="manager-profile-card"
          title={<div className="manager-card-title">Thông tin cá nhân</div>}
        >
          {!isEditing ? (
            <div className="manager-profile-combined-section">
              <div className="manager-profile-avatar-section">
                <UserProfileAvatar
                  profileData={formData}
                  role="manager"
                  avatarSize={72}
                  showRole={true}
                  customRoleDisplay="Quản lý"
                />
              </div>
              <div className="manager-profile-info-grid">
                <UserProfileDetails
                  profileData={formData}
                  role="manager"
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
                  className="manager-profile-details"
                />
              </div>
            </div>
          ) : (
            <div className="manager-profile-edit-section">
              <div className="manager-profile-avatar-section-edit">
                <UserProfileAvatar
                  profileData={formData}
                  role="manager"
                  avatarSize={72}
                  showRole={true}
                  customRoleDisplay="Quản lý"
                />
              </div>

              <UserProfileEditForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                loading={loading}
                role="manager"
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
                  email: "manager@example.com",
                  phone: "0123456789",
                }}
                onCancel={toggleEditMode}
                className="manager-profile-edit-form"
              />
            </div>
          )}
        </Card>

        {!isEditing && (
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TeamOutlined style={{ color: "#ff4d4f" }} />
                <span>Thông tin hệ thống</span>
              </div>
            }
            style={{
              marginTop: "24px",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div className="system-info-grid">
              <div className="system-info-item">
                <span className="system-info-label">Ngày tạo tài khoản:</span>
                <span className="system-info-value">
                  {convertJavaDateArray(profile.createdDate)?.format("HH:mm DD/MM/YYYY") || "Chưa cập nhật"}
                </span>
              </div>
              <div className="system-info-item">
                <span className="system-info-label">Cập nhật lần cuối:</span>
                <span className="system-info-value">
                  {convertJavaDateArray(profile.lastModifiedDate)?.format("HH:mm DD/MM/YYYY") || "Chưa cập nhật"}
                </span>
              </div>
              <div className="system-info-item">
                <span className="system-info-label">Trạng thái:</span>
                <Tag color={profile.enabled ? "green" : "red"}>
                  {profile.enabled ? "Hoạt động" : "Bị khóa"}
                </Tag>
              </div>
              <div className="system-info-item">
                <span className="system-info-label">Lần đầu đăng nhập:</span>
                <Tag color={profile.firstLogin ? "orange" : "green"}>
                  {profile.firstLogin ? "Chưa đổi mật khẩu" : "Đã hoàn thành"}
                </Tag>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManagerProfile;
