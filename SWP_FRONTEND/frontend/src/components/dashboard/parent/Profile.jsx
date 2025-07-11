import React, { useState, useEffect } from "react";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  message,
  Spin,
  Modal,
  Upload,
  Button,
  Card,
  Tag,
  Avatar,
} from "antd";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import { UserProfileDetails, UserProfileAvatar, UserProfileEditForm } from "../../common";
import HealthProfileDetailModal from "./HealthProfileDetailModal";
import "../../../styles/Profile.css";
import "../../../styles/SharedProfile.css";
import dayjs from "dayjs";

const Profile = ({ userInfo, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [parentProfile, setParentProfile] = useState(null);
  const [healthProfileModalVisible, setHealthProfileModalVisible] =
    useState(false);
  const [selectedHealthProfile, setSelectedHealthProfile] = useState(null);
  const [loadingHealthProfile, setLoadingHealthProfile] = useState(false);
  const { getToken, isParent } = useAuth();
  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    phone: userInfo?.phone || "",
    address: userInfo?.address || "",
    jobTitle: userInfo?.jobTitle || "Phụ huynh",
    dateOfBirth: userInfo?.dateOfBirth || "",
    emergencyContact: userInfo?.phone || "",
    relationship: userInfo?.gender === "M" ? "Cha" : "Mẹ",
  });
  
  const [errors, setErrors] = useState({});

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
          parentApi.getParentProfile(token),
        ]);

        console.log("Initial parent profile data:", profileData);

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
            console.error(
              "Invalid date format:",
              profileData.dateOfBirth,
              error
            );
            // Still use the default value of 1990-01-15
          }
        }

        // Create enhanced profile with defaults
        const enhancedProfile = {
          ...profileData,
          address: userAddress,
          jobTitle: userJobTitle,
          dateOfBirth: userDateOfBirth,
        };

        console.log("Using enhanced profile values:", {
          address: userAddress,
          jobTitle: userJobTitle,
          dateOfBirth: userDateOfBirth,
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
          emergencyContact:
            profileData.emergencyContact || profileData.phone || "",
          relationship:
            profileData.relationship ||
            (profileData.gender === "M" ? "Cha" : "Mẹ"),
        });

        if (studentsData && studentsData.length > 0) {
          console.log("Found students:", studentsData.length);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        message.error("Không thể tải thông tin. Vui lòng thử lại.");
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
  };

  // Handle viewing student health profile
  const handleViewHealthProfile = async (student) => {
    try {
      setLoadingHealthProfile(true);
      const token = getToken();

      console.log("Student data before API call:", student);

      // Try to get approved health profile by student ID
      const healthProfile = await parentApi.getApprovedHealthProfileByStudentId(
        student.id,
        token
      );

      console.log("Health profile data from API:", healthProfile);
      console.log(
        "Health profile keys:",
        healthProfile ? Object.keys(healthProfile) : "no data"
      );

      if (healthProfile) {
        // If health profile doesn't have student data embedded, add it
        const enhancedHealthProfile = {
          ...healthProfile,
          student: healthProfile.student || student, // Use student data if not embedded
          studentName:
            healthProfile.studentName ||
            `${student.lastName} ${student.firstName}`,
          studentClass: healthProfile.studentClass || student.className,
        };

        console.log("Enhanced health profile:", enhancedHealthProfile);

        setSelectedHealthProfile(enhancedHealthProfile);
        setHealthProfileModalVisible(true);
      } else {
        message.warning("Học sinh này chưa có hồ sơ sức khỏe");
      }
    } catch (error) {
      console.error("Error fetching health profile:", error);
      if (error.response?.status === 404) {
        message.warning("Học sinh này chưa có hồ sơ sức khỏe");
      } else {
        message.error("Không thể tải hồ sơ sức khỏe. Vui lòng thử lại.");
      }
    } finally {
      setLoadingHealthProfile(false);
    }
  };

  // Handle closing health profile modal
  const handleCloseHealthProfileModal = () => {
    setHealthProfileModalVisible(false);
    setSelectedHealthProfile(null);
  };
  const handleSubmit = async (e) => {
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
        phone: formData.phone,
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
        setFormData((prevData) => ({
          ...prevData,
          firstName: response.profile.firstName || prevData.firstName,
          lastName: response.profile.lastName || prevData.lastName,
          phone: response.profile.phone || prevData.phone,
          address: response.profile.address || prevData.address,
          jobTitle: response.profile.jobTitle || prevData.jobTitle,
          dateOfBirth: response.profile.dateOfBirth || prevData.dateOfBirth,
        }));

        // Also update the parentProfile state
        setParentProfile((prevProfile) => ({
          ...prevProfile,
          ...response.profile,
          address: response.profile.address || "123 Healthcare Ave",
          jobTitle: response.profile.jobTitle || "PARENT",
          dateOfBirth: response.profile.dateOfBirth || "1990-01-15",
        }));

        console.log("Profile updated with new values:", {
          address: response.profile.address,
          jobTitle: response.profile.jobTitle,
          dateOfBirth: response.profile.dateOfBirth,
        });

        // Trigger a parent component update if there's a callback
        if (typeof onProfileUpdate === "function") {
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
      [e.target.name]: e.target.value,
    });
  };

  // Upload functions for avatar
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Avatar upload completed successfully
      message.success("Cập nhật ảnh đại diện thành công!");
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
        <Card
          className="profile-main-card"
          title="Thông tin cá nhân"
          styles={{ body: { padding: "24px" } }}
        >
          <div className="profile-avatar-section">
            <UserProfileAvatar 
              profileData={formData}
              role="parent"
              avatarSize={120}
              showRole={true}
              customRoleDisplay="Phụ Huynh"
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
          </div>

          {isEditing ? (
            <UserProfileEditForm
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              role="parent"
              showFields={{
                firstName: true,
                lastName: true,
                phone: true,
                address: true,
                dateOfBirth: true,
                jobTitle: true,
                emergencyContact: true,
                relationship: true,
              }}
              customLabels={{
                firstName: "Tên",
                lastName: "Họ",
                phone: "Số điện thoại",
                address: "Địa chỉ",
                dateOfBirth: "Ngày sinh",
                jobTitle: "Nghề nghiệp",
                emergencyContact: "Số điện thoại khẩn cấp",
                relationship: "Mối quan hệ",
              }}
              onCancel={() => setIsEditing(false)}
              className="parent-profile-edit-form"
            />
          ) : (
            <UserProfileDetails
              profileData={formData}
              role="parent"
              showFields={{
                name: true,
                phone: true,
                dateOfBirth: true,
                relationship: true,
                jobTitle: true,
                address: true,
                emergencyContact: true,
              }}
              customLabels={{
                name: "Họ và tên",
                phone: "Số điện thoại",
                dateOfBirth: "Ngày sinh",
                relationship: "Mối quan hệ",
                jobTitle: "Nghề nghiệp",
                address: "Địa chỉ",
                emergencyContact: "Khẩn cấp",
              }}
              customFormatters={{
                dateOfBirth: (value) => {
                  if (!value) return "N/A";
                  try {
                    return dayjs(value).format("DD/MM/YYYY");
                  } catch {
                    return "N/A";
                  }
                },
                jobTitle: (value) => value || "PARENT",
                address: (value) => value || "123 Healthcare Ave",
              }}
              className="parent-profile-details"
            />
          )}
        </Card>
        <Card
          className="children-card"
          title="Thông tin con em"
          extra={<TeamOutlined />}
          styles={{ body: { padding: "24px" } }}
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Đang tải thông tin học sinh...</p>
            </div>
          ) : (
            <div className="children-list">
              {students && students.length > 0 ? (
                students.map((student) => (
                  <Card
                    key={student.id}
                    className="child-card"
                    size="small"
                    styles={{ body: { padding: "12px" } }}
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        size="small"
                        loading={loadingHealthProfile}
                        onClick={() => handleViewHealthProfile(student)}
                      >
                        Xem hồ sơ
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={`${student.lastName} ${student.firstName}`}
                      description={
                        <div>
                          <p>Lớp: {student.className || "N/A"}</p>
                          <p>
                            Sinh năm:{" "}
                            {dayjs(student.dob).format("DD/MM/YYYY") || "N/A"}
                          </p>
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

      <HealthProfileDetailModal
        visible={healthProfileModalVisible}
        onClose={handleCloseHealthProfileModal}
        healthProfile={selectedHealthProfile}
      />
    </div>
  );
};

export default Profile;
