import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Spin, message } from "antd";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { getAdminProfile, updateAdminProfile } from "../api/adminApi";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "./common";
import "../styles/AdminProfileCustom.css";
import "../styles/SharedProfile.css";

const AdminProfileCustom = ({ userInfo: initialUserInfo, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    jobTitle: "",
    username: "",
    dateOfBirth: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch admin profile data from API
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        console.log("Fetching admin profile from database...");

        const profileData = await getAdminProfile();
        console.log("Full admin profile data from API:", profileData);

        setAdminProfile(profileData);

        // Update form data with all available information
        setFormData({
          firstName: profileData.data.firstName || "",
          lastName: profileData.data.lastName || "",
          email: profileData.data.email || "",
          phone: profileData.data.phone || "",
          address: profileData.data.address || "",
          jobTitle: profileData.data.jobTitle || "Quản trị viên",
          username: profileData.data.username || "",
          dateOfBirth: profileData.data.dob || profileData.data.dateOfBirth || "",
          gender: profileData.data.gender || "",
        });

        console.log("Updated formData with profile:", {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          jobTitle: profileData.jobTitle,
          username: profileData.username,
          dob: profileData.dob || profileData.dateOfBirth,
          gender: profileData.gender,
        });
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        message.error(
          "Không thể tải thông tin admin. Sử dụng thông tin từ context."
        );

        // Fallback to initial userInfo if API fails
        if (initialUserInfo) {
          setFormData({
            firstName: initialUserInfo.firstName || "",
            lastName: initialUserInfo.lastName || "",
            email: initialUserInfo.email || "",
            phone: initialUserInfo.phone || "",
            address: initialUserInfo.address || "",
            jobTitle: initialUserInfo.jobTitle || "Quản trị viên",
            username: initialUserInfo.username || "",
            dateOfBirth: initialUserInfo.dob || initialUserInfo.dateOfBirth || "",
            gender: initialUserInfo.gender || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [initialUserInfo]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Tên không được để trống";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Họ không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        jobTitle: formData.jobTitle,
        dob: formData.dateOfBirth,
        gender: formData.gender,
      };

      console.log("Updating admin profile with:", updateData);

      const updatedProfile = await updateAdminProfile(updateData);
      console.log("Profile updated successfully:", updatedProfile);

      // Update local state with new data
      setAdminProfile(updatedProfile);

      // Notify parent component to refresh user list
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating admin profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Show loading spinner while fetching data
  if (loading && !adminProfile) {
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
          onClick={() => setIsEditing(!isEditing)}
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
              onCancel={() => setIsEditing(false)}
              className="admin-profile-edit-form"
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminProfileCustom;
