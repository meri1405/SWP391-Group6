import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Tag, Spin, message } from "antd";
import {
  UserOutlined,
  EditOutlined,
  CloseOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { nurseApi } from "../../../api/nurseApi";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "../../common";
import "../../../styles/SharedProfile.css";

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
        
        // Initialize form data
        setFormData({
          firstName: loadedProfile.firstName || "",
          lastName: loadedProfile.lastName || "",
          email: loadedProfile.email || "",
          phone: loadedProfile.phone || "",
          address: loadedProfile.address || "",
          dateOfBirth: loadedProfile.dateOfBirth || "",
          gender: loadedProfile.gender || "",
          jobTitle: loadedProfile.jobTitle || "Y tá Trường học",
          username: loadedProfile.username || "",
        });
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

  // Load data from API
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Form validation
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

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);

      const response = await nurseApi.updateProfile(formData);
      console.log("Response:", response);
      
      if (response && !response.error) {
        const updatedProfile = {
          ...response.profile,
          phone: response.profile.phone || "",
          completionLevel: calculateCompletionLevel(response.profile),
        };
        setProfileData(updatedProfile);
        setFormData(updatedProfile);
        setIsEditing(false);
        message.success("Cập nhật hồ sơ thành công");
        
        // Refresh profile data
        await fetchProfileData();
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

  // Show loading spinner while fetching data
  if (loading && !profileData.firstName) {
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

  if (!profileData) {
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
          onClick={() => setIsEditing(!isEditing)}
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
                onCancel={() => setIsEditing(false)}
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