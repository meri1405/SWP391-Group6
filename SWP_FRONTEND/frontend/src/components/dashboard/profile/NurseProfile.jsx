import React, { useCallback } from "react";
import { Card, Button, Spin } from "antd";
import {
  EditOutlined,
  CloseOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "../../common";
import { useProfileEditLogic } from "../../../hooks/useProfileEditLogic";
import { nurseProfileConfig } from "../../../hooks/profileConfigs";
import "../../../styles/SharedProfile.css";

const NurseProfile = () => {
  // Use the profile edit logic hook with nurse configuration
  const {
    isEditing,
    loading,
    formData,
    errors,
    requiredFields,
    handleChange,
    handleSubmit,
    toggleEditMode,
  } = useProfileEditLogic(nurseProfileConfig);

  // Format functions (keep these for display formatting)
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa cập nhật";
    }
  }, []);

  const formatPhoneNumber = useCallback((phone) => {
    if (!phone) return "Chưa cập nhật";
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return phone;
  }, []);

  const formatGender = useCallback((gender) => {
    if (!gender) return "Chưa cập nhật";
    switch (gender.toLowerCase()) {
      case "male":
      case "m":
        return "Nam";
      case "female":
      case "f":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  }, []);

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
        <span style={{ marginLeft: "16px" }}>Đang tải thông tin y tá...</span>
      </div>
    );
  }

  if (!formData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <span>Không thể tải thông tin hồ sơ</span>
      </div>
    );
  }

  return (
    <div className="nurse-profile-container">
      <div className="nurse-profile-header">
        <div className="nurse-header-content">
          <h2>
            <MedicineBoxOutlined style={{ color: "#52c41a" }} /> Hồ Sơ Cá Nhân
          </h2>
          <p>Y tá trường học - Quản lý thông tin cá nhân</p>
        </div>
        <Button
          type={isEditing ? "default" : "primary"}
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={toggleEditMode}
          size="large"
          style={{ 
            backgroundColor: isEditing ? undefined : "#52c41a", 
            borderColor: isEditing ? undefined : "#52c41a" 
          }}
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      <div className="nurse-profile-content">
        <Card
          className="nurse-profile-card"
          title={<div className="nurse-card-title">Thông tin cá nhân</div>}
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
          {!isEditing ? (
            <div className="nurse-profile-combined-section">
              <div className="nurse-profile-avatar-section">
                <UserProfileAvatar 
                  profileData={formData}
                  role="nurse"
                  avatarSize={72}
                  showRole={true}
                  customRoleDisplay="Y tá trường học"
                />
              </div>

              <div className="nurse-profile-info-grid">
                <UserProfileDetails
                  profileData={formData}
                  role="nurse"
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
                    jobTitle: "VAI TRÒ",
                  }}
                  customFormatters={{
                    phone: formatPhoneNumber,
                    dateOfBirth: formatDate,
                    gender: formatGender,
                  }}
                  className="nurse-profile-details"
                />
              </div>
            </div>
          ) : (
            <div className="nurse-profile-edit-section">
              <div className="nurse-profile-avatar-section-edit">
                <UserProfileAvatar 
                  profileData={formData}
                  role="nurse"
                  avatarSize={72}
                  showRole={true}
                  customRoleDisplay="Y tá trường học"
                />
              </div>
              
              <UserProfileEditForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                loading={loading}
                role="nurse"
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
                  jobTitle: "Vai trò",
                }}
                customPlaceholders={{
                  email: "nurse@example.com",
                  phone: "0123456789",
                }}
                onCancel={toggleEditMode}
                className="nurse-profile-edit-form"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NurseProfile;