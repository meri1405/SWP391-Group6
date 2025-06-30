import React, { useState, useEffect, useCallback } from "react";
import { Spin, message, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  TrophyOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { nurseApi } from "../../../api/nurseApi";
import "../../../styles/NurseProfile.css";
const NurseProfile = () => {
  const [profileData, setProfileData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    avatar: "",
    username: "",
    jobTitle: "",
    specialization: "Y tá Trường học",
    department: "Phòng Y tế",
    employeeId: "",
    status: "active",
    completionLevel: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  // Format functions
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

  // Helper function to calculate completion level
  const calculateCompletionLevel = useCallback((data) => {
    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "dateOfBirth",
      "gender",
      "jobTitle",
    ];

    const filledFields = fields.filter((field) => {
      const value = data[field];
      return value && value.toString().trim() !== "";
    });

    return Math.round((filledFields.length / fields.length) * 100);
  }, []);

  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await nurseApi.getProfile();
      console.log("Response:", response);
      if (response.success) {
        const loadedProfile = {
          ...response.data,
          phone: response.data.phone || "",
          completionLevel: calculateCompletionLevel(response.data),
        };
        setProfileData(loadedProfile);
        setEditedData(loadedProfile);
      } else {
        message.error("Không thể tải thông tin hồ sơ: " + response.message);
      }
    } catch (error) {
      console.error("Error fetching nurse profile:", error);
      message.error("Đã xảy ra lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [calculateCompletionLevel]);

  // Load data from API and userInfo
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await nurseApi.updateProfile(editedData);
      console.log("Response:", response);
      
      if (response && !response.error) {
        const updatedProfile = {
          ...response.profile,
          phone: response.profile.phone || "",
          completionLevel: calculateCompletionLevel(response.profile),
        };
        setProfileData(updatedProfile);
        setEditedData(updatedProfile);
        setIsEditing(false);
        message.success("Cập nhật hồ sơ thành công");
      } else {
        message.error("Không thể cập nhật hồ sơ: " + (response.message || 'Đã có lỗi xảy ra'));
      }
    } catch (error) {
      console.error("Error updating nurse profile:", error);
      message.error("Đã xảy ra lỗi khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="nurse-profile-loading">
        <Spin size="large" />
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="nurse-profile-container">
      {/* Profile Header Card */}
      <div className="nurse-profile-header-card">
        <div className="nurse-profile-header-content">
          <div className="nurse-profile-avatar-section">
            <div className="nurse-profile-avatar-container">
              <div className="nurse-profile-avatar-wrapper">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Avatar"
                    className="nurse-profile-avatar-image"
                  />
                ) : (
                  <div className="nurse-profile-avatar-placeholder">
                    <UserOutlined />
                  </div>
                )}
              </div>
            </div>

            <div className="nurse-profile-info-section">
              <div className="nurse-profile-name-container">
                <h1 className="nurse-profile-name" style={{color: "white"}}>
                  {profileData.lastName} {profileData.firstName}
                </h1>
                <Button
                  type={isEditing ? "default" : "primary"}
                  icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
              </div>

              <div className="nurse-profile-details">
                {profileData.phone && (
                  <div className="nurse-profile-detail-item">
                    <PhoneOutlined />
                    <span>{formatPhoneNumber(profileData.phone)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Grid */}
      <div className="nurse-profile-content-grid">
        {/* Personal Information */}
        <div className="nurse-profile-card">
          <div className="nurse-profile-card-header">
            <h3>
              <UserOutlined />
              Thông tin cá nhân
            </h3>
          </div>
          <div className="nurse-profile-card-content">
            {isEditing ? (
              <form className="nurse-profile-form">
                <div className="nurse-profile-form-grid">
                  <div className="nurse-form-group">
                    <label>
                      <UserOutlined /> HỌ
                    </label>
                    <input
                      type="text"
                      value={editedData.lastName || ""}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>

                  <div className="nurse-form-group">
                    <label>
                      <UserOutlined /> TÊN
                    </label>
                    <input
                      type="text"
                      value={editedData.firstName || ""}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>

                  <div className="nurse-form-group">
                    <label>
                      <MailOutlined /> EMAIL
                    </label>
                    <input
                      type="email"
                      value={editedData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div className="nurse-form-group">
                    <label>
                      <PhoneOutlined /> SỐ ĐIỆN THOẠI
                    </label>
                    <input
                      type="tel"
                      value={editedData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="nurse-form-group">
                    <label>
                      <CalendarOutlined /> NGÀY SINH
                    </label>
                    <input
                      type="date"
                      value={editedData.dateOfBirth || ""}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>

                  <div className="nurse-form-group">
                    <label>
                      <UserOutlined /> GIỚI TÍNH
                    </label>
                    <select
                      value={editedData.gender || ""}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="M">Nam</option>
                      <option value="F">Nữ</option>
                      <option value="O">Khác</option>
                    </select>
                  </div>

                  <div className="nurse-form-group nurse-form-group-full">
                    <label>
                      <HomeOutlined /> ĐỊA CHỈ
                    </label>
                    <input
                      type="text"
                      value={editedData.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                </div>

                <div className="nurse-profile-form-actions">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveProfile}
                    loading={loading}
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData(profileData);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            ) : (
              <div className="nurse-profile-form-grid">
                <div className="nurse-form-group">
                  <label>
                    <UserOutlined /> HỌ VÀ TÊN
                  </label>
                  <div className="nurse-form-value">
                    {profileData.lastName} {profileData.firstName}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <MailOutlined /> EMAIL
                  </label>
                  <div className="nurse-form-value">
                    {profileData.email || "Chưa cập nhật"}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <PhoneOutlined /> SỐ ĐIỆN THOẠI
                  </label>
                  <div className="nurse-form-value">
                    {formatPhoneNumber(profileData.phone)}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <UserOutlined /> TÊN ĐĂNG NHẬP
                  </label>
                  <div className="nurse-form-value">
                    {profileData.username || "Chưa cập nhật"}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <CalendarOutlined /> NGÀY SINH
                  </label>
                  <div className="nurse-form-value">
                    {formatDate(profileData.dateOfBirth)}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <UserOutlined /> GIỚI TÍNH
                  </label>
                  <div className="nurse-form-value">
                    {formatGender(profileData.gender)}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <MedicineBoxOutlined /> CHỨC VỤ
                  </label>
                  <div className="nurse-form-value">
                    {profileData.specialization || "Y tá Trường học"}
                  </div>
                </div>

                <div className="nurse-form-group">
                  <label>
                    <IdcardOutlined /> VAI TRÒ
                  </label>
                  <div className="nurse-form-value">
                    {profileData.jobTitle || "Chưa cập nhật"}
                  </div>
                </div>

                <div className="nurse-form-group nurse-form-group-full">
                  <label>
                    <HomeOutlined /> ĐỊA CHỈ
                  </label>
                  <div className="nurse-form-value">
                    {profileData.address || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfile;