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
  TeamOutlined,
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
  Avatar 
} from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { parentApi } from "../../api/parentApi";
import "../../styles/Profile.css";

const Profile = ({ userInfo, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);  const [previewImage, setPreviewImage] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [parentProfile, setParentProfile] = useState(null);
  const { getToken, isParent } = useAuth();
  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    phone: userInfo?.phone || "",
    address: userInfo?.address || "123 Healthcare Ave",
    jobTitle: userInfo?.jobTitle || "PARENT",
    dateOfBirth: userInfo?.dateOfBirth || "1990-01-15",
    emergencyContact: userInfo?.phone || "",
    relationship: userInfo?.gender === "M" ? "Cha" : "Mẹ",
  });  // Function to refresh parent profile - used after profile updates
  // eslint-disable-next-line no-unused-vars
  const refreshParentProfile = async () => {
      if (!isParent()) return;
      
      try {
        const token = getToken();
        const profileData = await parentApi.getParentProfile(token);
        
        console.log('Refreshed parent profile:', profileData);
        
        // Apply default values to refreshed profile
        const enhancedProfile = {
          ...profileData,
          address: profileData.address || "123 Healthcare Ave",
          jobTitle: profileData.jobTitle || "PARENT",
          dateOfBirth: profileData.dateOfBirth || "1990-01-15"
        };
        
        setParentProfile(enhancedProfile);
        // Return the enhanced profile in case needed by caller
        return enhancedProfile;
      } catch (error) {
        console.error('Error refreshing parent profile:', error);
        return null;
      }
    };const [errors, setErrors] = useState({});
  
  // Unified fetch data effect - combines all previous data loading effects
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isParent()) return;
      
      try {
        setLoading(true);
        const token = getToken();
        
        // Load both students and parent profile in parallel
        const [studentsData, profileData] = await Promise.all([
          parentApi.getMyStudents(token),
          parentApi.getParentProfile(token)
        ]);
        
        console.log('Initial parent profile data:', profileData);
        
        // Apply default values for missing fields
        const userAddress = profileData.address || "123 Healthcare Ave";
        const userJobTitle = profileData.jobTitle || "PARENT";
          // For date fields, ensure they are in YYYY-MM-DD format
        let userDateOfBirth = "1990-01-15"; // Default birth date
        if (profileData.dateOfBirth) {
          try {
            // If it's already a valid date string, use it as is
            userDateOfBirth = profileData.dateOfBirth;
            
            // Test if we can parse it as a date
            new Date(userDateOfBirth);
            console.log("Using date of birth:", userDateOfBirth);
          } catch (error) {
            // Log the error and use default value
            console.error("Invalid date format:", profileData.dateOfBirth, error);
            // Still use the default value of 1990-01-15
          }
        }
        
        // Create enhanced profile with defaults
        const enhancedProfile = {
          ...profileData,
          address: userAddress,
          jobTitle: userJobTitle,
          dateOfBirth: userDateOfBirth
        };
        
        console.log('Using enhanced profile values:', {
          address: userAddress,
          jobTitle: userJobTitle,
          dateOfBirth: userDateOfBirth
        });
        
        // Update state with all data at once
        setStudents(studentsData);
        setParentProfile(enhancedProfile);
        
        // Update form data with consistent values
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          phone: profileData.phone || "",
          address: userAddress,
          jobTitle: userJobTitle,
          dateOfBirth: userDateOfBirth,
          emergencyContact: profileData.emergencyContact || profileData.phone || "",
          relationship: profileData.relationship || 
                      (profileData.gender === "M" ? "Cha" : "Mẹ"),
        });
        
        if (studentsData && studentsData.length > 0) {
          console.log("Found students:", studentsData.length);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        message.error('Không thể tải thông tin. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we have user auth
    if (userInfo) {
      console.log("User info loaded, fetching profile data");
      fetchAllData();
    }
  }, [userInfo, isParent, getToken]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Họ không được để trống";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Tên không được để trống";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      
      // Prepare data for API call - include all required fields
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };
      
      // Include optional fields if they have values
      if (formData.address) {
        updateData.address = formData.address;
        console.log("Including address in update:", updateData.address);
      }
      
      if (formData.jobTitle) {
        updateData.jobTitle = formData.jobTitle;
        console.log("Including jobTitle in update:", updateData.jobTitle);
      }
      
      if (formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth;
        console.log("Including dateOfBirth in update:", updateData.dateOfBirth);
      }
      
      console.log("Sending profile update with data:", updateData);
      
      // Call the API to update profile
      const response = await parentApi.updateParentProfile(token, updateData);
      
      console.log("Profile update response:", response);
      
      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      setErrors({});
      
      // Update the local form data with the response data
      if (response.profile) {
        console.log("Updated profile from API:", response.profile);
        
        // Update the form data with the response values
        setFormData(prevData => ({
          ...prevData,
          firstName: response.profile.firstName || prevData.firstName,
          lastName: response.profile.lastName || prevData.lastName,
          phone: response.profile.phone || prevData.phone,
          address: response.profile.address || prevData.address,
          jobTitle: response.profile.jobTitle || prevData.jobTitle,
          dateOfBirth: response.profile.dateOfBirth || prevData.dateOfBirth,
        }));
        
        // Also update the parentProfile state
        setParentProfile(prevProfile => ({
          ...prevProfile,
          ...response.profile,
          address: response.profile.address || "123 Healthcare Ave",
          jobTitle: response.profile.jobTitle || "PARENT",
          dateOfBirth: response.profile.dateOfBirth || "1990-01-15"
        }));
        
        console.log("Profile updated with new values:", {
          address: response.profile.address,
          jobTitle: response.profile.jobTitle,
          dateOfBirth: response.profile.dateOfBirth
        });
          
        // Trigger a parent component update if there's a callback
        if (typeof onProfileUpdate === 'function') {
          console.log("Calling onProfileUpdate with:", response.profile);
          onProfileUpdate(response.profile);
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Upload functions for avatar
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      setAvatarUrl(info.file.response.url);
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

  return (    <div className="profile-container">
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
      </div><div className="profile-content">
        <Card 
          className="profile-main-card" 
          title="Thông tin cá nhân"
          styles={{ body: { padding: '24px' } }}
        >
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
            )}            <div className="profile-basic-info">
              <h3>
                {formData.lastName} {formData.firstName}
              </h3>
              <Tag color="blue" icon={<TeamOutlined />}>
                Phụ Huynh
              </Tag>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">              <div className="form-row">
                <div className="form-group">
                  <label>Họ</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

                <div className="form-row">
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
                  </div>                </div>

              <div className="form-section">
                <h4>Thông tin cơ bản</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => {
                        console.log("Date changed to:", e.target.value);
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value
                        });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mối quan hệ</label>
                    <input
                      type="text"
                      name="relationship"
                      value={formData.relationship || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Thông tin liên hệ</h4>                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={(e) => {
                      console.log("Address changed to:", e.target.value);
                      setFormData({
                        ...formData,
                        address: e.target.value
                      });
                    }}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div><div className="form-row">
                  <div className="form-group">
                    <label>Nghề nghiệp</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle || ""}
                      onChange={(e) => {
                        console.log("Job title changed to:", e.target.value);
                        setFormData({
                          ...formData,
                          jobTitle: e.target.value
                        });
                      }}
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

              <div className="form-actions">
                <button type="submit" className="save-btn">Lưu thay đổi</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Hủy
                </button>
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
                        {formData.lastName} {formData.firstName}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <PhoneOutlined className="info-icon" />
                    <div>
                      <label>Số điện thoại</label>
                      <span>{formData.phone}</span>
                    </div>
                  </div>                  <div className="info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <label>Ngày sinh</label>
                      <span>{formData.dateOfBirth || "1990-01-15"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <TeamOutlined className="info-icon" />
                    <div>
                      <label>Mối quan hệ</label>
                      <span>{formData.relationship}</span>
                    </div>
                  </div>                  <div className="info-item">
                    <BankOutlined className="info-icon" />
                    <div>
                      <label>Nghề nghiệp</label>
                      <span>{formData.jobTitle || "PARENT"}</span>
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
                      <span>{formData.address || "123 Healthcare Ave"}</span>
                    </div>
                  </div>
                  <div className="info-item full-width">
                      <PhoneOutlined className="info-icon" />
                      <div>
                        <label>Số điện thoại khẩn cấp</label>
                        <span>
                          {formData.emergencyContact}
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
          styles={{ body: { padding: '24px' } }}
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Đang tải thông tin học sinh...</p>
            </div>
          ) : (
            <div className="children-list">
              {students && students.length > 0 ? (
                students.map((student) => (                  <Card
                    key={student.id}
                    className="child-card"
                    size="small"
                    styles={{ body: { padding: '12px' } }}                    actions={[
                      <Button key="view" type="link" size="small">
                        Xem hồ sơ
                      </Button>,
                      <Button key="edit" type="link" size="small">
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
                <div className="no-children">
                  <p>Không có thông tin học sinh</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>   
         
      <Modal
        open={previewVisible}
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
