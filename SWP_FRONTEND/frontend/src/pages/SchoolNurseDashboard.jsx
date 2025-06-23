import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Spin,
  message,
  Upload,
  Progress,
} from "antd";
import { useAuth } from "../contexts/AuthContext";
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  InboxOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  BellOutlined,
} from "@ant-design/icons";
import NurseMedicationRequests from "../components/dashboard/NurseMedicationRequests";
import NurseMedicationSchedules from "../components/dashboard/NurseMedicationSchedules";
import { VaccinationRuleManagement } from "../components/dashboard/admin/vaccinations";
import { MedicalSupplyInventory } from "../components/dashboard/admin/inventory";
import { Notifications } from "../components/dashboard/admin/notifications";
// Import nurseApi
import { nurseApi } from "../api/nurseApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "../styles/SchoolNurseDashboard.css";
import "../styles/SidebarTrigger.css";
import NurseHealthProfiles from "../components/dashboard/NurseHealthProfiles";
import { MedicalEventManagement } from "../components/dashboard/admin/events";
// Import the vaccination campaign management component
import VaccinationCampaignManagement from "../components/schoolnurse/vaccinationCampaign/VaccinationCampaignManagement";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const { Header, Sider, Content } = Layout;

const SchoolNurseDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isSchoolNurse, setUserInfo, getToken } =
    useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfoState] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchParams] = useSearchParams();

  // Sample data for the dashboard
  const [stats] = useState({
    totalMedicineReceived: 156,
    totalMedicalEvents: 89,
    totalVaccinations: 450,
    totalHealthChecks: 1200,
  });

  // Navigation items specific to SchoolNurse role
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Thông báo",
    },
    {
      key: "medication-requests",
      icon: <FileDoneOutlined />,
      label: "Duyệt yêu cầu thuốc",
    },
    {
      key: "medication-schedules",
      icon: <ClockCircleOutlined />,
      label: "Quản lý lịch uống thuốc",
    },
    {
      key: "events",
      icon: <AlertOutlined />,
      label: "Ghi nhận sự kiện y tế",
    },
    {
      key: "inventory",
      icon: <InboxOutlined />,
      label: "Giám sát tồn kho",
    },
    {
      key: "restock-requests",
      icon: <MailOutlined />,
      label: "Yêu cầu bổ sung vật tư",
    },
    {
      key: "vaccination",
      icon: <CalendarOutlined />,
      label: "Chiến dịch tiêm chủng",
    },
    {
      key: "vaccination-rule-management",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý quy tắc tiêm chủng",
    },
    {
      key: "health-check",
      icon: <HeartOutlined />,
      label: "Đợt khám sức khỏe",
    },
    {
      key: "health-records",
      icon: <FileTextOutlined />,
      label: "Hồ sơ y tế học sinh",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;
    setActiveSection(tabKey);

    const newUrl =
      tabKey === "dashboard"
        ? "/school-nurse-dashboard"
        : `/school-nurse-dashboard?tab=${tabKey}`;

    window.history.pushState(null, "", newUrl);
  };

  const getBreadcrumbItems = () => {
    const currentItem = menuItems.find((item) => item.key === activeSection);
    return [
      {
        title: "Dashboard",
      },
      {
        title: currentItem?.label || "Tổng quan",
      },
    ];
  };

  useEffect(() => {
    console.log("Auth check:", {
      isAuthenticated,
      user,
      isSchoolNurse: typeof isSchoolNurse,
    });

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // Kiểm tra role với fallback
    const checkNurseRole = () => {
      if (typeof isSchoolNurse === "function") {
        try {
          return isSchoolNurse();
        } catch (error) {
          console.warn("Error calling isSchoolNurse function:", error);
          return false;
        }
      }
      // Fallback check
      return (
        user?.role === "SCHOOLNURSE" ||
        user?.roleName === "SCHOOLNURSE" ||
        user?.role === "SCHOOL_NURSE"
      );
    };

    if (!checkNurseRole()) {
      console.log("Not school nurse role, user role:", user?.role);
      message.error("Bạn không có quyền truy cập vào trang này");
      navigate("/");
      return;
    }

    console.log("Setting user info:", user);
    setUserInfoState(user);
  }, [navigate, isAuthenticated, isSchoolNurse, user]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const validTabs = [
        "dashboard",
        "notifications",
        "medication-requests",
        "medication-schedules",
        "events",
        "inventory",
        "restock-requests",
        "vaccination",
        "vaccination-rule-management",
        "health-check",
        "health-records",
        "profile",
      ];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      } else {
        setActiveSection("dashboard");
        window.history.replaceState(null, "", "/school-nurse-dashboard");
      }
    } else {
      setActiveSection("dashboard");
    }
  }, [searchParams]);

  // Dashboard Overview Component (giữ nguyên như cũ)
  const DashboardOverview = () => {
    console.log("Rendering DashboardOverview");

    const barChartData = {
      labels: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
      ],
      datasets: [
        {
          label: "Số lượng sự kiện y tế",
          data: [12, 19, 15, 25, 22, 30],
          backgroundColor: "rgba(25, 118, 210, 0.8)",
          borderColor: "rgba(25, 118, 210, 1)",
          borderWidth: 1,
        },
      ],
    };

    const doughnutChartData = {
      labels: ["Thuốc đã nhận", "Sự kiện y tế", "Tiêm chủng", "Khám sức khỏe"],
      datasets: [
        {
          data: [156, 89, 450, 1200],
          backgroundColor: [
            "rgba(25, 118, 210, 0.8)",
            "rgba(76, 175, 80, 0.8)",
            "rgba(255, 193, 7, 0.8)",
            "rgba(156, 39, 176, 0.8)",
          ],
          borderColor: [
            "rgba(25, 118, 210, 1)",
            "rgba(76, 175, 80, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(156, 39, 176, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    };

    return (
      <div className="dashboard-overview">
        <h2>Tổng quan Y tế Học đường</h2>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalMedicineReceived}</h3>
              <p>Thuốc đã nhận</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalMedicalEvents}</h3>
              <p>Sự kiện y tế</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalVaccinations}</h3>
              <p>Số mũi tiêm chủng</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalHealthChecks}</h3>
              <p>Lượt khám sức khỏe</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-container">
              <h3>Thống kê sự kiện y tế theo tháng</h3>
              <div className="chart-wrapper">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h3>Phân bố hoạt động y tế</h3>
              <div className="chart-wrapper">
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Component giống AdminDashboard
  const ProfileComponent = () => {
    console.log("Rendering ProfileComponent with userInfo:", userInfo);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Activity stats state
    const [activityStats, setActivityStats] = useState({
      medicalEventsHandled: 0,
      vaccinationsPerformed: 0,
      healthChecksPerformed: 0,
      medicationRequestsApproved: 0,
    });

    // Activity history state
    const [activityHistory, setActivityHistory] = useState([]);

    // Profile data state - giống Parent Dashboard
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
      specialization: "Y tá Trường học",
      department: "Phòng Y tế",
      employeeId: "",
      licenseNumber: "",
      experience: "",
      workingHours: "7:00 - 17:00",
      education: "",
      joinDate: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      status: "active",
      completionLevel: 0,
    });

    const [originalData, setOriginalData] = useState({});

    // Load activity stats và history
    useEffect(() => {
      const loadActivityData = async () => {
        try {
          setLoading(true);

          // Mock data for activity stats
          const mockStats = {
            medicalEventsHandled: 45,
            vaccinationsPerformed: 123,
            healthChecksPerformed: 67,
            medicationRequestsApproved: 89,
          };

          // Mock data for activity history
          const mockHistory = [
            {
              id: 1,
              type: "medical_event",
              description: "Xử lý sự kiện té ngã của học sinh Nguyễn Văn A",
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
            {
              id: 2,
              type: "vaccination",
              description:
                "Thực hiện tiêm vaccine COVID-19 cho học sinh lớp 10A",
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            },
            {
              id: 3,
              type: "medication",
              description: "Duyệt yêu cầu thuốc hạ sốt cho học sinh Trần Thị B",
              createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            },
            {
              id: 4,
              type: "health_check",
              description:
                "Thực hiện khám sức khỏe định kỳ cho học sinh lớp 9B",
              createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            },
            {
              id: 5,
              type: "medical_event",
              description: "Xử lý trường hợp đau bụng của học sinh Lê Văn C",
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            },
          ];

          // TODO: Replace with real API calls
          // const statsResponse = await nurseApi.getActivityStats();
          // const historyResponse = await nurseApi.getActivityHistory();

          setActivityStats(mockStats);
          setActivityHistory(mockHistory);
        } catch (error) {
          console.error("Error loading activity data:", error);
          // Set empty defaults on error
          setActivityStats({
            medicalEventsHandled: 0,
            vaccinationsPerformed: 0,
            healthChecksPerformed: 0,
            medicationRequestsApproved: 0,
          });
          setActivityHistory([]);
        } finally {
          setLoading(false);
        }
      };

      loadActivityData();
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
        "specialization",
        "licenseNumber",
        "experience",
        "education",
        "emergencyContactName",
        "emergencyContactPhone",
      ];

      const filledFields = fields.filter((field) => {
        const value = data[field];
        return value && value.toString().trim() !== "";
      });

      return Math.round((filledFields.length / fields.length) * 100);
    }, []);

    // Format functions giống Parent
    const formatDate = useCallback((dateString) => {
      if (!dateString) return "Chưa cập nhật";
      try {
        return new Date(dateString).toLocaleDateString("vi-VN");
      } catch (error) {
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

    // Load data từ userInfo như Parent Dashboard
    useEffect(() => {
      if (userInfo) {
        console.log("Loading userInfo into profileData:", userInfo);

        const loadedProfile = {
          id: userInfo.id || "",
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          address: userInfo.address || "",
          dateOfBirth: userInfo.dateOfBirth || "",
          gender: userInfo.gender || "",
          avatar: userInfo.avatar || "",
          username: userInfo.username || "",
          specialization: userInfo.specialization || "Y tá Trường học",
          department: userInfo.department || "Phòng Y tế",
          employeeId: userInfo.employeeId || "NV001",
          licenseNumber: userInfo.licenseNumber || "",
          experience: userInfo.experience || "",
          workingHours: userInfo.workingHours || "7:00 - 17:00",
          education: userInfo.education || "",
          joinDate: userInfo.joinDate || new Date().toISOString().split("T")[0],
          emergencyContactName: userInfo.emergencyContactName || "",
          emergencyContactPhone: userInfo.emergencyContactPhone || "",
          status: userInfo.status || "active",
        };

        // Calculate completion level
        loadedProfile.completionLevel = calculateCompletionLevel(loadedProfile);

        setProfileData(loadedProfile);
        setOriginalData(loadedProfile);
      }
    }, [userInfo, calculateCompletionLevel]);

    // Save profile function - giống Parent Dashboard
    const handleSaveProfile = async () => {
      try {
        setSaving(true);

        // Validation giống Parent
        if (
          !profileData.firstName?.trim() ||
          !profileData.lastName?.trim() ||
          !profileData.email?.trim()
        ) {
          message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
          message.error("Email không hợp lệ");
          return;
        }

        // Phone validation
        if (
          profileData.phone &&
          !/^[0-9+\-\s()]{10,15}$/.test(profileData.phone.replace(/\s/g, ""))
        ) {
          message.error("Số điện thoại không hợp lệ");
          return;
        }

        console.log("Saving profile:", profileData);

        // Calculate new completion level
        const updatedProfile = {
          ...profileData,
          completionLevel: calculateCompletionLevel(profileData),
        };

        // TODO: Call API giống Parent Dashboard
        // const response = await nurseApi.updateProfile(updatedProfile);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        message.success("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        setProfileData(updatedProfile);
        setOriginalData(updatedProfile);

        // Update userInfo in context
        if (setUserInfo) {
          setUserInfo({
            ...userInfo,
            ...updatedProfile,
          });
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        message.error("Có lỗi xảy ra khi cập nhật hồ sơ");
      } finally {
        setSaving(false);
      }
    };

    const handleCancelEdit = () => {
      setProfileData(originalData);
      setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // Avatar upload giống Parent
    const handleAvatarUpload = async (file) => {
      try {
        setUploadingAvatar(true);

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          message.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
          return false;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          message.error("Kích thước file không được vượt quá 5MB");
          return false;
        }

        // TODO: Upload avatar API giống Parent
        const avatarUrl = URL.createObjectURL(file);

        setProfileData((prev) => ({
          ...prev,
          avatar: avatarUrl,
        }));

        message.success("Cập nhật avatar thành công!");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        message.error("Không thể tải lên avatar");
      } finally {
        setUploadingAvatar(false);
      }

      return false;
    };

    if (loading) {
      return (
        <div className="nurse-profile-loading">
          <Spin size="large" />
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      );
    }

    // JSX giống hoàn toàn như code hiện tại, nhưng giờ activityStats và activityHistory đã được define
    return (
      <div className="nurse-profile-container">
        {/* Profile Header Card - Improved Design */}
        <div className="nurse-profile-header-card">
          <div className="nurse-profile-background">
            <div className="nurse-profile-background-overlay"></div>
            <div className="nurse-profile-background-pattern"></div>
          </div>

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

                  <Upload
                    showUploadList={false}
                    beforeUpload={handleAvatarUpload}
                    accept="image/*"
                    className="nurse-avatar-upload-trigger"
                  >
                    <div className="nurse-avatar-upload-overlay">
                      <CameraOutlined />
                      {uploadingAvatar && <Spin size="small" />}
                    </div>
                  </Upload>
                </div>
              </div>

              <div className="nurse-profile-info-section">
                <div className="nurse-profile-name-container">
                  <h1 className="nurse-profile-name">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                </div>

                <p className="nurse-profile-role">
                  <TrophyOutlined />
                  {profileData.specialization}
                </p>

                <div className="nurse-profile-details">
                  <div className="nurse-profile-detail-item">
                    <IdcardOutlined />
                    <span>{profileData.department}</span>
                  </div>

                  {profileData.username && (
                    <div className="nurse-profile-detail-item">
                      <UserOutlined />
                      <span>{profileData.username}</span>
                    </div>
                  )}

                  {profileData.phone && (
                    <div className="nurse-profile-detail-item">
                      <PhoneOutlined />
                      <span>{formatPhoneNumber(profileData.phone)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="nurse-profile-actions">
              {isEditing ? (
                <div className="nurse-edit-actions">
                  <button
                    className="nurse-btn nurse-btn-success"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? <Spin size="small" /> : <SaveOutlined />}
                    <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                  </button>
                  <button
                    className="nurse-btn nurse-btn-default"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <CloseOutlined />
                    <span>Hủy</span>
                  </button>
                </div>
              ) : (
                <div className="nurse-view-actions">
                  <button
                    className="nurse-btn nurse-btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <EditOutlined />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="nurse-stats-grid">
          <div className="nurse-stat-card primary">
            <div className="nurse-stat-card-content">
              <div className="nurse-stat-icon">
                <AlertOutlined />
              </div>
              <div className="nurse-stat-info">
                <h3>{activityStats.medicalEventsHandled}</h3>
                <p>Sự kiện y tế đã xử lý</p>
                <span className="nurse-stat-change positive">
                  +12% tháng này
                </span>
              </div>
            </div>
          </div>

          <div className="nurse-stat-card success">
            <div className="nurse-stat-card-content">
              <div className="nurse-stat-icon">
                <MedicineBoxOutlined />
              </div>
              <div className="nurse-stat-info">
                <h3>{activityStats.vaccinationsPerformed}</h3>
                <p>Mũi tiêm đã thực hiện</p>
                <span className="nurse-stat-change positive">
                  +8% tháng này
                </span>
              </div>
            </div>
          </div>

          <div className="nurse-stat-card warning">
            <div className="nurse-stat-card-content">
              <div className="nurse-stat-icon">
                <HeartOutlined />
              </div>
              <div className="nurse-stat-info">
                <h3>{activityStats.healthChecksPerformed}</h3>
                <p>Lượt khám sức khỏe</p>
                <span className="nurse-stat-change positive">
                  +15% tháng này
                </span>
              </div>
            </div>
          </div>

          <div className="nurse-stat-card info">
            <div className="nurse-stat-card-content">
              <div className="nurse-stat-icon">
                <FileDoneOutlined />
              </div>
              <div className="nurse-stat-info">
                <h3>{activityStats.medicationRequestsApproved}</h3>
                <p>Yêu cầu thuốc đã duyệt</p>
                <span className="nurse-stat-change positive">
                  +5% tháng này
                </span>
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
              <div className="nurse-profile-form-grid">
                <div className="nurse-form-group">
                  <label>
                    Họ <span className="nurse-required">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="nurse-input"
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Nhập họ"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.lastName || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>
                    Tên <span className="nurse-required">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="nurse-input"
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Nhập tên"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.firstName || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>
                    <MailOutlined /> Email{" "}
                    <span className="nurse-required">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="nurse-input"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Nhập email"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.email || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>
                    <PhoneOutlined /> Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="nurse-input"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại (VD: 0123456789)"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {formatPhoneNumber(profileData.phone)}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>Ngày sinh</label>
                  {isEditing ? (
                    <input
                      type="date"
                      className="nurse-input"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      max={
                        new Date(
                          new Date().getFullYear() - 18,
                          new Date().getMonth(),
                          new Date().getDate()
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                      min={
                        new Date(
                          new Date().getFullYear() - 70,
                          new Date().getMonth(),
                          new Date().getDate()
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {formatDate(profileData.dateOfBirth)}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>Giới tính</label>
                  {isEditing ? (
                    <select
                      className="nurse-input"
                      value={profileData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  ) : (
                    <div className="nurse-form-value">
                      {formatGender(profileData.gender)}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group nurse-form-group-full">
                  <label>
                    <HomeOutlined /> Địa chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="nurse-input"
                      value={profileData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Nhập địa chỉ đầy đủ"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.address || "Chưa cập nhật"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="nurse-profile-card">
            <div className="nurse-profile-card-header">
              <h3>
                <MedicineBoxOutlined />
                Thông tin nghề nghiệp
              </h3>
            </div>
            <div className="nurse-profile-card-content">
              <div className="nurse-profile-form-grid">
                <div className="nurse-form-group">
                  <label>Chuyên môn</label>
                  {isEditing ? (
                    <select
                      className="nurse-input"
                      value={profileData.specialization}
                      onChange={(e) =>
                        handleInputChange("specialization", e.target.value)
                      }
                    >
                      <option value="Y tá Trường học">Y tá Trường học</option>
                      <option value="Y tá Nhi khoa">Y tá Nhi khoa</option>
                      <option value="Y tá Cấp cứu">Y tá Cấp cứu</option>
                      <option value="Y tá Phòng chống dịch">
                        Y tá Phòng chống dịch
                      </option>
                    </select>
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.specialization}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>Số chứng chỉ hành nghề</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="nurse-input"
                      value={profileData.licenseNumber}
                      onChange={(e) =>
                        handleInputChange("licenseNumber", e.target.value)
                      }
                      placeholder="Số chứng chỉ hành nghề"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.licenseNumber || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>Kinh nghiệm (năm)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="nurse-input"
                      value={profileData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      placeholder="Số năm kinh nghiệm"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.experience
                        ? `${profileData.experience} năm`
                        : "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>Giờ làm việc</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="nurse-input"
                      value={profileData.workingHours}
                      onChange={(e) =>
                        handleInputChange("workingHours", e.target.value)
                      }
                      placeholder="Ví dụ: 7:00 - 17:00"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.workingHours}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group nurse-form-group-full">
                  <label>Trình độ học vấn</label>
                  {isEditing ? (
                    <textarea
                      className="nurse-input nurse-textarea"
                      rows="3"
                      value={profileData.education}
                      onChange={(e) =>
                        handleInputChange("education", e.target.value)
                      }
                      placeholder="Mô tả trình độ học vấn, bằng cấp..."
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.education || "Chưa cập nhật"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="nurse-profile-card">
            <div className="nurse-profile-card-header">
              <h3>
                <PhoneOutlined />
                Liên hệ khẩn cấp
              </h3>
            </div>
            <div className="nurse-profile-card-content">
              <div className="nurse-profile-form-grid">
                <div className="nurse-form-group">
                  <label>Tên người liên hệ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="nurse-input"
                      value={profileData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      placeholder="Tên người liên hệ khẩn cấp"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {profileData.emergencyContactName || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="nurse-form-group">
                  <label>Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="nurse-input"
                      value={profileData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      placeholder="SĐT người liên hệ khẩn cấp"
                    />
                  ) : (
                    <div className="nurse-form-value">
                      {formatPhoneNumber(profileData.emergencyContactPhone)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="nurse-profile-card nurse-profile-card-full">
            <div className="nurse-profile-card-header">
              <h3>
                <ClockCircleOutlined />
                Lịch sử hoạt động gần đây
              </h3>
            </div>
            <div className="nurse-profile-card-content">
              <div className="nurse-activity-list">
                {activityHistory.length > 0 ? (
                  activityHistory.slice(0, 5).map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="nurse-activity-item"
                    >
                      <div className="nurse-activity-icon">
                        {activity.type === "medical_event" && <AlertOutlined />}
                        {activity.type === "vaccination" && (
                          <MedicineBoxOutlined />
                        )}
                        {activity.type === "medication" && <FileDoneOutlined />}
                        {activity.type === "health_check" && <HeartOutlined />}
                      </div>
                      <div className="nurse-activity-content">
                        <div className="nurse-activity-description">
                          {activity.description}
                        </div>
                        <div className="nurse-activity-time">
                          {new Date(activity.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="nurse-no-activity">
                    <p>Chưa có hoạt động nào được ghi nhận</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Các components khác giữ nguyên như cũ...
  const MedicalEvents = () => <MedicalEventManagement />;

  const Inventory = () => <MedicalSupplyInventory />;

  // Update the Vaccination component to use the VaccinationCampaignManagement
  const Vaccination = () => {
    return (
      <div className="nurse-content-card">
        <VaccinationCampaignManagement />
      </div>
    );
  };

  const HealthCheck = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Đợt khám sức khỏe</h2>
      <p>Component đang được phát triển...</p>
    </div>
  );

  const HealthRecords = () => <NurseHealthProfiles />;

  // Component cho trang yêu cầu bổ sung vật tư
  const RestockRequests = () => {
    // Sử dụng React.lazy để import động component
    const [RestockRequestListComponent, setRestockRequestListComponent] =
      React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Import động sử dụng ES6 import()
      import("../components/dashboard/admin/inventory")
        .then((module) => ({ default: module.RestockRequestList }))
        .then((module) => {
          setRestockRequestListComponent(() => module.default);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading RestockRequestList:", error);
          setLoading(false);
        });
    }, []);

    if (loading) {
      return (
        <div
          className="nurse-content-card"
          style={{ textAlign: "center", padding: "20px" }}
        >
          <Spin size="large" />
          <p style={{ marginTop: "10px" }}>Đang tải danh sách yêu cầu...</p>
        </div>
      );
    }

    if (!RestockRequestListComponent) {
      return (
        <div className="nurse-content-card">
          <p>Không thể tải component. Vui lòng thử lại sau.</p>
        </div>
      );
    }

    return (
      <div className="nurse-content-card">
        <RestockRequestListComponent />
      </div>
    );
  };

  // Add NotificationsTab component
  const NotificationsTab = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Thông báo</h2>
      <Notifications role="schoolnurse" />
    </div>
  );

  // Update renderContent function to include NotificationsTab
  const renderContent = () => {
    console.log("Rendering content for section:", activeSection);

    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "notifications":
        return <NotificationsTab />;
      case "medication-requests":
        return <NurseMedicationRequests />;
      case "medication-schedules":
        return <NurseMedicationSchedules />;
      case "events":
        return <MedicalEvents />;
      case "inventory":
        return <Inventory />;
      case "restock-requests":
        return <RestockRequests />;
      case "vaccination":
        return <Vaccination />;
      case "vaccination-rule-management":
        return <VaccinationRuleManagement />;
      case "health-check":
        return <HealthCheck />;
      case "health-records":
        return <HealthRecords />;
      case "profile":
        return <ProfileComponent />;
      default:
        return <DashboardOverview />;
    }
  };

  console.log(
    "Rendering main dashboard, userInfo:",
    userInfo,
    "activeSection:",
    activeSection
  );

  if (!userInfo) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f4f6fb",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="school-nurse-dashboard">
      <Sider
        width={240}
        collapsed={collapsed}
        theme="light"
        className="nurse-sidebar"
        style={{
          borderRight: "1px solid #f0f0f0",
          background: "#fff",
          zIndex: 10,
          paddingTop: 24,
          position: "relative",
        }}
        trigger={null}
      >
        <div className="nurse-user-section">
          <div className="nurse-user-avatar">
            <UserOutlined style={{ fontSize: 32, color: "#1976d2" }} />
          </div>
          {!collapsed && (
            <span className="nurse-user-badge">Y tá Trường học</span>
          )}
        </div>

        <Menu
          theme="light"
          selectedKeys={[activeSection]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: "none", fontWeight: 500, fontSize: 16 }}
        />

        <div
          className="custom-sidebar-trigger"
          onClick={() => setCollapsed(!collapsed)}
          tabIndex={0}
          role="button"
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCollapsed(!collapsed);
            }
          }}
        >
          {collapsed ? (
            <RightOutlined className="icon-right" />
          ) : (
            <LeftOutlined className="icon-left" />
          )}
          {!collapsed && <span className="trigger-text">Thu gọn</span>}
        </div>
      </Sider>

      <Layout style={{ marginLeft: 0 }}>
        <Header className="nurse-header">
          <div style={{ flex: 1 }}>
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ fontSize: 14, marginBottom: 4 }}
            />
            <h1 className="nurse-header-title">
              Bảng điều khiển Y tá Trường học
            </h1>
          </div>

          <div className="nurse-header-user">
            <div className="nurse-header-avatar">
              <UserOutlined style={{ fontSize: 20, color: "#1976d2" }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.firstName || ""} {userInfo?.lastName || ""}
            </span>
          </div>
        </Header>

        <Content className="nurse-content">{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default SchoolNurseDashboard;
