import React, { useState, useEffect } from "react";
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
  TeamOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { parentApi } from "../../api/parentApi";
import "../../styles/Profile.css";

const Profile = ({ userInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    email: userInfo?.email || "",
    phone: userInfo?.phone || "",
    address: userInfo?.address || "",
    jobTitle: userInfo?.jobTitle || "",
    dateOfBirth: userInfo?.dateOfBirth || "",
    emergencyContact: userInfo?.emergencyContact || "",
    relationship: userInfo?.relationship || "Cha/Mẹ",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userInfo) {
      setFormData({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        address: userInfo.address || "",
        jobTitle: userInfo.jobTitle || "",
        dateOfBirth: userInfo.dateOfBirth || "",
        emergencyContact: userInfo.emergencyContact || "",
        relationship: userInfo.relationship || "Cha/Mẹ",
      });
    }
  }, [userInfo]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const studentsData = await parentApi.getMyStudents(token);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        message.error("Không thể tải thông tin học sinh");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [getToken]);

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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
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
      // API call to update profile would go here
      // await parentApi.updateProfile(formData);
      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

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

  const handleAvatarChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response.url);
      setLoading(false);
      message.success("Tải ảnh đại diện thành công");
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

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
          onClick={() => setIsEditing(!isEditing)}
          size="large"
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      <div className="profile-content">
        <Card className="profile-main-card" title="Thông tin cá nhân">
          <div className="profile-avatar-section">
            <Avatar
              size={120}
              src={avatarUrl}
              icon={<UserOutlined />}
              className="profile-avatar-large"
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
                {formData.firstName} {formData.lastName}
              </h3>
              <Tag color="blue" icon={<TeamOutlined />}>
                Phụ Huynh
              </Tag>
            </div>
          </div>

          <Divider />

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form-enhanced">
              <div className="form-section">
                <h4>Thông tin cơ bản</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "error" : ""}
                      placeholder="Nhập họ"
                    />
                    {errors.firstName && (
                      <span className="error-text">{errors.firstName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tên *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "error" : ""}
                      placeholder="Nhập tên"
                    />
                    {errors.lastName && (
                      <span className="error-text">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <span className="error-text">{errors.email}</span>
                    )}
                  </div>
                  <div className="form-group">
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
                      <span className="error-text">{errors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mối quan hệ</label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                    >
                      <option value="Cha/Mẹ">Cha/Mẹ</option>
                      <option value="Ông/Bà">Ông/Bà</option>
                      <option value="Anh/Chị">Anh/Chị</option>
                      <option value="Người giám hộ">Người giám hộ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Thông tin liên hệ</h4>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nghề nghiệp</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="Nhập nghề nghiệp"
                    />
                  </div>
                  <div className="form-group">
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
              </div>

              <div className="form-actions-enhanced">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
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
              <div className="info-section">
                <h4>Thông tin cơ bản</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <UserOutlined className="info-icon" />
                    <div>
                      <label>Họ và tên</label>
                      <span>
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <MailOutlined className="info-icon" />
                    <div>
                      <label>Email</label>
                      <span>{formData.email}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <PhoneOutlined className="info-icon" />
                    <div>
                      <label>Số điện thoại</label>
                      <span>{formData.phone}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <label>Ngày sinh</label>
                      <span>{formData.dateOfBirth || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <TeamOutlined className="info-icon" />
                    <div>
                      <label>Mối quan hệ</label>
                      <span>{formData.relationship}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <BankOutlined className="info-icon" />
                    <div>
                      <label>Nghề nghiệp</label>
                      <span>{formData.jobTitle || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="info-section">
                <h4>Thông tin liên hệ</h4>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <HomeOutlined className="info-icon" />
                    <div>
                      <label>Địa chỉ</label>
                      <span>{formData.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <PhoneOutlined className="info-icon" />
                    <div>
                      <label>Số điện thoại khẩn cấp</label>
                      <span>
                        {formData.emergencyContact || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          className="children-card"
          title="Thông tin con em"
          extra={<TeamOutlined />}
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Đang tải thông tin học sinh...</p>
            </div>
          ) : (
            <div className="children-list-enhanced">
              {students && students.length > 0 ? (
                students.map((student) => (
                  <Card
                    key={student.id}
                    className="child-card"
                    size="small"
                    actions={[
                      <Button type="link" size="small">
                        Xem hồ sơ
                      </Button>,
                      <Button type="link" size="small">
                        Chỉnh sửa
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={`${student.firstName} ${student.lastName}`}
                      description={
                        <div>
                          <p>Lớp: {student.className || "N/A"}</p>
                          <p>Sinh năm: {student.birthYear || "N/A"}</p>
                          <Tag color="green">Đang học</Tag>
                        </div>
                      }
                    />
                  </Card>
                ))
              ) : (
                <div className="no-children-enhanced">
                  <UserOutlined style={{ fontSize: "48px", color: "#ccc" }} />
                  <p>Không có thông tin học sinh</p>
                  <Button type="primary" ghost>
                    Thêm thông tin con em
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <Modal
        visible={previewVisible}
        title="Xem trước ảnh"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default Profile;
