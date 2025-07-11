import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Spin, message } from "antd";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import managerApi from "../../api/managerApi";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "../common";
import "../../styles/ProfileSection.css";
import "../../styles/SharedProfile.css";

const ManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    jobTitle: "",
    username: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchManagerProfile();
  }, []);

  const fetchManagerProfile = async () => {
    setLoading(true);
    try {
      const data = await managerApi.getManagerProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        dateOfBirth: data.dob ? (Array.isArray(data.dob) ? convertJavaDateArray(data.dob)?.format("YYYY-MM-DD") : dayjs(data.dob).format("YYYY-MM-DD")) : "",
        gender: data.gender || "",
        jobTitle: data.jobTitle || "Quản lý",
        username: data.username || "",
      });
    } catch (error) {
      message.error("Không thể tải thông tin hồ sơ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Tên không được để trống";
    if (!formData.lastName.trim()) newErrors.lastName = "Họ không được để trống";
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        dob: formData.dateOfBirth || null,
      };
      const updatedProfile = await managerApi.updateManagerProfile(submitData);
      setProfile(updatedProfile);
      setIsEditing(false);
      message.success("Cập nhật thông tin thành công!");
      await fetchManagerProfile();
    } catch (error) {
      console.error("Error updating manager profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin: " + error.message);
    } finally {
      setLoading(false);
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
          onClick={() => setIsEditing(!isEditing)}
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
                onCancel={() => setIsEditing(false)}
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
