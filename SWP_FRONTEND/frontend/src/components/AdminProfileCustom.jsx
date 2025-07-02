import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Spin, message } from "antd";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
  SettingOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  BankOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { getAdminProfile, updateAdminProfile } from "../api/adminApi";
import "../styles/AdminProfileCustom.css";

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
    dob: "",
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
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          jobTitle: profileData.jobTitle || "Quản trị viên",
          username: profileData.username || "",
          dob: profileData.dob || profileData.dateOfBirth || "",
          gender: profileData.gender || "",
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
            dob: initialUserInfo.dob || "",
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
        dob: formData.dob,
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
              <div className="admin-profile-avatar-large">
                <div className="admin-avatar-placeholder">
                  <UserOutlined style={{ fontSize: 48 }} />
                </div>
              </div>
              {isEditing && (
                <Button icon={<EditOutlined />} size="small" disabled>
                  Đổi ảnh
                </Button>
              )}

              <div className="admin-profile-basic-info">
                <h3>
                  {formData.lastName} {formData.firstName}
                </h3>
                <Tag color="red" icon={<SettingOutlined />}>
                  Quản trị viên
                </Tag>
              </div>
            </div>

            {!isEditing && (
              <div className="admin-profile-info-grid">
                <div className="admin-info-grid">
                  <div className="admin-info-item">
                    <UserOutlined className="admin-info-icon" />
                    <div>
                      <label>HỌ VÀ TÊN</label>
                      <span>
                        {formData.lastName && formData.firstName
                          ? `${formData.lastName} ${formData.firstName}`
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <MailOutlined className="admin-info-icon" />
                    <div>
                      <label>EMAIL</label>
                      <span>{formData.email || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <PhoneOutlined className="admin-info-icon" />
                    <div>
                      <label>SỐ ĐIỆN THOẠI</label>
                      <span>{formData.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <UserOutlined className="admin-info-icon" />
                    <div>
                      <label>TÊN ĐĂNG NHẬP</label>
                      <span>{formData.username || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <CalendarOutlined className="admin-info-icon" />
                    <div>
                      <label>NGÀY SINH</label>
                      <span>
                        {formData.dob
                          ? new Date(formData.dob).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <UserOutlined className="admin-info-icon" />
                    <div>
                      <label>GIỚI TÍNH</label>
                      <span>
                        {formData.gender === "M"
                          ? "Nam"
                          : formData.gender === "F"
                          ? "Nữ"
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <BankOutlined className="admin-info-icon" />
                    <div>
                      <label>CHỨC VỤ</label>
                      <span>{formData.jobTitle || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <SettingOutlined className="admin-info-icon" />
                    <div>
                      <label>VAI TRÒ</label>
                      <span>Quản trị viên</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <HomeOutlined className="admin-info-icon" />
                    <div>
                      <label>ĐỊA CHỈ</label>
                      <span>{formData.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <form onSubmit={handleSubmit} className="admin-profile-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Họ *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "error" : ""}
                    required
                  />
                  {errors.lastName && (
                    <span className="admin-error-text">{errors.lastName}</span>
                  )}
                </div>
                <div className="admin-form-group">
                  <label>Tên *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "error" : ""}
                    required
                  />
                  {errors.firstName && (
                    <span className="admin-error-text">{errors.firstName}</span>
                  )}
                </div>
              </div>

              <div className="admin-form-section">
                <h4>Thông tin tài khoản</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      placeholder="admin@example.com"
                    />
                    {errors.email && (
                      <span className="admin-error-text">{errors.email}</span>
                    )}
                  </div>
                  <div className="admin-form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error" : ""}
                      placeholder="0123456789"
                    />
                    {errors.phone && (
                      <span className="admin-error-text">{errors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-form-actions">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  Lưu thay đổi
                </Button>
                <Button
                  type="default"
                  onClick={() => setIsEditing(false)}
                  size="large"
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminProfileCustom;
