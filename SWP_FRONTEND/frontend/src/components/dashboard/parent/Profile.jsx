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
import { useProfileEditLogic } from "../../../hooks/useProfileEditLogic";
import { createParentProfileConfig } from "../../../hooks/profileConfigs";
import HealthProfileDetailModal from "./HealthProfileDetailModal";
import "../../../styles/Profile.css";
import "../../../styles/SharedProfile.css";
import dayjs from "dayjs";

const Profile = ({ userInfo, onProfileUpdate }) => {
  const { getToken, isParent } = useAuth();
  
  // Use the profile edit logic hook with parent configuration
  const parentConfig = createParentProfileConfig(getToken());
  const {
    isEditing,
    loading: profileLoading,
    formData,
    errors,
    requiredFields,
    handleChange,
    handleSubmit,
    toggleEditMode,
  } = useProfileEditLogic({
    ...parentConfig,
    initialData: userInfo,
    onProfileUpdate,
  });

  // Separate state for students and other non-profile data
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [healthProfileModalVisible, setHealthProfileModalVisible] = useState(false);
  const [selectedHealthProfile, setSelectedHealthProfile] = useState(null);
  const [loadingHealthProfile, setLoadingHealthProfile] = useState(false);

  // Fetch students data (profile data is handled by the hook)
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!isParent()) return;

      try {
        setLoading(true);
        const token = getToken();
        const studentsData = await parentApi.getMyStudents(token);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        message.error("Không thể tải thông tin học sinh. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch students data if we have user auth
    if (userInfo) {
      console.log("User info loaded, fetching student data");
      fetchStudentData();
    }
  }, [userInfo, isParent, getToken]);

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
          onClick={toggleEditMode}
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
          </div>

          {isEditing ? (
            <UserProfileEditForm
              formData={formData}
              errors={errors}
              requiredFields={requiredFields}
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
              }}
              customLabels={{
                firstName: "Tên",
                lastName: "Họ",
                phone: "Số điện thoại",
                address: "Địa chỉ",
                dateOfBirth: "Ngày sinh",
                jobTitle: "Nghề nghiệp",
              }}
              onCancel={toggleEditMode}
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
          {loading || profileLoading ? (
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

      <HealthProfileDetailModal
        visible={healthProfileModalVisible}
        onClose={handleCloseHealthProfileModal}
        healthProfile={selectedHealthProfile}
      />
    </div>
  );
};

export default Profile;
