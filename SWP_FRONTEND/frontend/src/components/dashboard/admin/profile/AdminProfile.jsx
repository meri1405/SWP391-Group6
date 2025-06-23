import React, { useState, useEffect } from "react";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  BankOutlined,
  CalendarOutlined,
  IdcardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  message,
  Spin,
  Modal,
  Upload,
  Button,
  Card,
  Divider,
  Tag,
  Avatar,
} from "antd";
import { useAuth } from "../../../../contexts/AuthContext";
import "../../../../styles/AdminProfile.css";

const AdminProfile = ({ userInfo, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});

  const { getToken, user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || user?.firstName || "",
    lastName: userInfo?.lastName || user?.lastName || "",
    email: userInfo?.email || user?.email || "",
    phone: userInfo?.phone || user?.phone || "",
    address: userInfo?.address || user?.address || "",
    jobTitle: userInfo?.jobTitle || user?.jobTitle || "Quản trị viên hệ thống",
    dateOfBirth:
      userInfo?.dob ||
      userInfo?.dateOfBirth ||
      user?.dob ||
      user?.dateOfBirth ||
      "",
    employeeId: userInfo?.employeeId || user?.employeeId || "ADMIN001",
    department: userInfo?.department || user?.department || "Phòng IT",
    emergencyContact:
      userInfo?.emergencyContact || userInfo?.phone || user?.phone || "",
    gender: userInfo?.gender || user?.gender || "M",
    startDate:
      userInfo?.startDate ||
      user?.startDate ||
      new Date().toISOString().split("T")[0],
  }); // Update form data when userInfo or user changes
  useEffect(() => {
    console.log("=== AdminProfile Debug ===");
    console.log("userInfo:", userInfo);
    console.log("user:", user);
    if (userInfo || user) {
      const currentUser = userInfo || user;
      console.log("Using currentUser:", currentUser);
      console.log("All currentUser keys:", Object.keys(currentUser));
      console.log(
        "Full currentUser object:",
        JSON.stringify(currentUser, null, 2)
      );
      console.log("currentUser.phone:", currentUser.phone);
      console.log("currentUser.dob:", currentUser.dob);
      console.log("currentUser.dateOfBirth:", currentUser.dateOfBirth);

      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        jobTitle: currentUser.jobTitle || "Quản trị viên hệ thống",
        dateOfBirth: currentUser.dob || currentUser.dateOfBirth || "",
        employeeId: currentUser.employeeId || "ADMIN001",
        department: currentUser.department || "Phòng IT",
        emergencyContact:
          currentUser.emergencyContact || currentUser.phone || "",
        gender: currentUser.gender || "M",
        startDate:
          currentUser.startDate || new Date().toISOString().split("T")[0],
      });

      console.log("=== Set FormData ===");
      console.log("phone:", currentUser.phone);
      console.log("dateOfBirth:", currentUser.dateOfBirth);
    }
  }, [userInfo, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Họ không được để trống";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Chức vụ không được để trống";
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

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
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

      // Simulate API call for now
      // In real implementation, you would call an admin API endpoint
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        jobTitle: formData.jobTitle,
        dateOfBirth: formData.dateOfBirth,
        employeeId: formData.employeeId,
        department: formData.department,
        emergencyContact: formData.emergencyContact,
        gender: formData.gender,
        startDate: formData.startDate,
      };

      console.log("Updating admin profile with data:", updateData);

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      setErrors({});

      // Trigger parent component update if callback exists
      if (typeof onProfileUpdate === "function") {
        onProfileUpdate(updateData);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  // Upload functions for avatar
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ được upload file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Hình ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response?.url);
      setLoading(false);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-header">
        <div className="header-content">
          <h2>
            <UserOutlined /> Hồ Sơ Quản Trị Viên
          </h2>
          <p>Quản lý thông tin cá nhân và công việc</p>
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

      <div className="profile-content">
        <Card
          className="admin-profile-main-card"
          title="Thông tin cá nhân"
          styles={{ body: { padding: "24px" } }}
        >
          <div className="admin-avatar-section">
            <Avatar
              size={120}
              src={avatarUrl}
              icon={<UserOutlined />}
              className="admin-profile-avatar-large"
            />
            {isEditing && (
              <Upload
                name="avatar"
                listType="picture"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
                onPreview={handlePreview}
              >
                <Button icon={<UploadOutlined />} size="small">
                  Đổi ảnh
                </Button>
              </Upload>
            )}

            <div className="profile-basic-info">
              <h3>
                {formData.lastName} {formData.firstName}
              </h3>
              <Tag color="red" icon={<SettingOutlined />}>
                Quản Trị Viên
              </Tag>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="admin-form-section">
                <h4>Thông tin cơ bản</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Họ và tên đệm *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "error" : ""}
                      placeholder="Nhập họ và tên đệm"
                    />
                    {errors.lastName && (
                      <span className="admin-error-text">
                        {errors.lastName}
                      </span>
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
                      placeholder="Nhập tên"
                    />
                    {errors.firstName && (
                      <span className="admin-error-text">
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      placeholder="admin@school.edu"
                    />
                    {errors.email && (
                      <span className="admin-error-text">{errors.email}</span>
                    )}
                  </div>
                  <div className="admin-form-group">
                    <label>Số điện thoại *</label>
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

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="M">Nam</option>
                      <option value="F">Nữ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>Thông tin công việc</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Chức vụ *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className={errors.jobTitle ? "error" : ""}
                      placeholder="Quản trị viên hệ thống"
                    />
                    {errors.jobTitle && (
                      <span className="admin-error-text">
                        {errors.jobTitle}
                      </span>
                    )}
                  </div>
                  <div className="admin-form-group">
                    <label>Phòng ban</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="Phòng IT">Phòng IT</option>
                      <option value="Phòng Y tế">Phòng Y tế</option>
                      <option value="Phòng Giáo vụ">Phòng Giáo vụ</option>
                      <option value="Phòng Hành chính">Phòng Hành chính</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Mã nhân viên</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="ADMIN001"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Ngày bắt đầu làm việc</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>Thông tin liên hệ</h4>
                <div className="admin-form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Số điện thoại khẩn cấp</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="admin-form-actions-enhanced">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                  className="admin-btn-primary"
                >
                  Lưu thay đổi
                </Button>
                <Button onClick={() => setIsEditing(false)} size="large">
                  Hủy
                </Button>
              </div>
            </form>
          ) : (
            <div className="profile-info-enhanced">
              <div className="admin-info-section">
                <h4>Thông tin cơ bản</h4>
                <div className="admin-info-grid">
                  <div className="admin-info-item">
                    <UserOutlined className="info-icon" />
                    <div>
                      <label>Họ và tên</label>
                      <span>
                        {formData.lastName} {formData.firstName}
                      </span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <MailOutlined className="info-icon" />
                    <div>
                      <label>Email</label>
                      <span>{formData.email}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <PhoneOutlined className="info-icon" />
                    <div>
                      <label>Số điện thoại</label>
                      <span>{formData.phone}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <label>Ngày sinh</label>
                      <span>{formData.dateOfBirth || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <IdcardOutlined className="info-icon" />
                    <div>
                      <label>Giới tính</label>
                      <span>{formData.gender === "M" ? "Nam" : "Nữ"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="admin-info-section">
                <h4>Thông tin công việc</h4>
                <div className="admin-info-grid">
                  <div className="admin-info-item">
                    <BankOutlined className="info-icon" />
                    <div>
                      <label>Chức vụ</label>
                      <span>{formData.jobTitle}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <SettingOutlined className="info-icon" />
                    <div>
                      <label>Phòng ban</label>
                      <span>{formData.department}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <IdcardOutlined className="info-icon" />
                    <div>
                      <label>Mã nhân viên</label>
                      <span>{formData.employeeId}</span>
                    </div>
                  </div>
                  <div className="admin-info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <label>Ngày bắt đầu</label>
                      <span>{formData.startDate || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="admin-info-section">
                <h4>Thông tin liên hệ</h4>
                <div className="admin-info-grid">
                  <div className="admin-info-item full-width">
                    <HomeOutlined className="info-icon" />
                    <div>
                      <label>Địa chỉ</label>
                      <span>{formData.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="admin-info-item full-width">
                    <PhoneOutlined className="info-icon" />
                    <div>
                      <label>Số điện thoại khẩn cấp</label>
                      <span>{formData.emergencyContact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* System Information Card */}
        <Card
          className="system-info-card"
          title="Thông tin hệ thống"
          extra={<SettingOutlined />}
          styles={{ body: { padding: "24px" } }}
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Đang tải thông tin...</p>
            </div>
          ) : (
            <div className="system-info-list">
              <div className="system-info-item">
                <div className="info-label">Quyền truy cập:</div>
                <div className="info-value">
                  <Tag color="red">Super Admin</Tag>
                </div>
              </div>
              <div className="system-info-item">
                <div className="info-label">Lần đăng nhập cuối:</div>
                <div className="info-value">
                  {new Date().toLocaleDateString("vi-VN")} -{" "}
                  {new Date().toLocaleTimeString("vi-VN")}
                </div>
              </div>
              <div className="system-info-item">
                <div className="info-label">Trạng thái tài khoản:</div>
                <div className="info-value">
                  <Tag color="green">Hoạt động</Tag>
                </div>
              </div>
              <div className="system-info-item">
                <div className="info-label">Ngày tạo tài khoản:</div>
                <div className="info-value">
                  {formData.startDate
                    ? new Date(formData.startDate).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title="Xem trước ảnh đại diện"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default AdminProfile;
