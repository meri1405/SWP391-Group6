import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Spin, message } from "antd";
import { useAuth } from "../contexts/AuthContext";
import {
  DashboardOutlined,
  BellOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import Overview from "../components/dashboard/parent/Overview";
import "../styles/SidebarTrigger.css";
import { Notifications } from "../components/dashboard/notifications";
import MedicationManagement from "../components/dashboard/parent/MedicationManagement";
import { VaccinationSchedule } from "../components/dashboard/vaccinations";
import Profile from "../components/dashboard/parent/Profile";
import HealthProfileDeclaration from "../components/dashboard/parent/HealthProfileDeclaration";
import ApprovedHealthProfile from "../components/dashboard/parent/ApprovedHealthProfile";
import MissingHealthProfileModal from "../components/dashboard/parent/MissingHealthProfileModal";
import HealthCheckResults from "../components/dashboard/parent/HealthCheckResults";
import { parentApi } from "../api/parentApi";

const { Header, Sider, Content } = Layout;

const ParentDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [userInfo, setUserInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showMissingHealthProfileModal, setShowMissingHealthProfileModal] = useState(false);
  const [studentsMissingHealthProfile, setStudentsMissingHealthProfile] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      disabled: studentsMissingHealthProfile.length > 0,
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Thông báo",
      disabled: studentsMissingHealthProfile.length > 0,
    },
    {
      key: "health-profile-declaration",
      icon: <MedicineBoxOutlined />,
      label: "Khai báo hồ sơ",
      style: studentsMissingHealthProfile.length > 0 ? { 
        backgroundColor: '#fff2f0',
        border: '2px solid #ff4d4f',
        borderRadius: '4px',
        fontWeight: 'bold'
      } : {},
    },
    {
      key: "health-history",
      icon: <FileTextOutlined />,
      label: "Tiền sử sức khỏe",
      disabled: studentsMissingHealthProfile.length > 0,
    },
    {
      key: "health-check-results",
      icon: <ExperimentOutlined />,
      label: "Kết quả khám",
      disabled: studentsMissingHealthProfile.length > 0,
    },
    {
      key: "medication",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý thuốc",
      disabled: studentsMissingHealthProfile.length > 0,
    },
    {
      key: "vaccination",
      icon: <CalendarOutlined />,
      label: "Lịch tiêm chủng",
      disabled: studentsMissingHealthProfile.length > 0,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
      disabled: studentsMissingHealthProfile.length > 0,
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;
    
    // Block all navigation except health profile declaration if students are missing health profiles
    if (studentsMissingHealthProfile.length > 0 && tabKey !== "health-profile-declaration") {
      message.warning("Bạn phải hoàn thành khai báo hồ sơ y tế cho tất cả học sinh trước khi sử dụng tính năng này!");
      return;
    }
    
    setActiveSection(tabKey);

    if (tabKey === "overview") {
      navigate("/parent-dashboard");
    } else {
      navigate(`/parent-dashboard?tab=${tabKey}`);
    }
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
  const { user, isAuthenticated, isParent, getToken } = useAuth();

  // Check for missing health profiles after authentication
  useEffect(() => {
    const checkMissingHealthProfiles = async () => {
      if (!isAuthenticated || !isParent() || !getToken()) return;

      try {
        const studentsMissing = await parentApi.getStudentsMissingHealthProfiles(getToken());
        if (studentsMissing && studentsMissing.length > 0) {
          setStudentsMissingHealthProfile(studentsMissing);
          // Show modal only if user is not already on health profile declaration page
          const currentTab = searchParams.get("tab");
          if (currentTab !== "health-profile-declaration") {
            setShowMissingHealthProfileModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking missing health profiles:', error);
        // If API fails, try to get students and check manually
        try {
          const students = await parentApi.getMyStudents(getToken());
          const studentsWithoutProfile = [];
          
          for (const student of students) {
            try {
              const healthProfiles = await parentApi.getHealthProfilesByStudentId(student.id, getToken());
              if (!healthProfiles || healthProfiles.length === 0) {
                studentsWithoutProfile.push(student);
              }
            } catch {
              // If we can't get health profiles, assume student doesn't have one
              studentsWithoutProfile.push(student);
            }
          }
          
          if (studentsWithoutProfile.length > 0) {
            setStudentsMissingHealthProfile(studentsWithoutProfile);
            const currentTab = searchParams.get("tab");
            if (currentTab !== "health-profile-declaration") {
              setShowMissingHealthProfileModal(true);
            }
          }
        } catch (fallbackError) {
          console.error('Error in fallback health profile check:', fallbackError);
        }
      }
    };

    checkMissingHealthProfiles();
  }, [isAuthenticated, isParent, getToken, searchParams]);

  useEffect(() => {
    // Redirect if not authenticated or not a parent
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isParent()) {
      message.error("Bạn không có quyền truy cập vào trang này");
      navigate("/");
      return;
    }

    // Fetch detailed user profile from API
    const fetchUserProfile = async () => {
      if (!user?.id || !getToken()) return;
      
      try {
        console.log('Fetching detailed parent profile');
        const detailedProfile = await parentApi.getParentProfile(getToken());
        console.log('Detailed profile received:', detailedProfile);
        
        // Merge basic user info with detailed profile
        const mergedUserInfo = {
          ...user,
          ...detailedProfile,
          // Ensure critical fields are preserved
          firstName: detailedProfile?.firstName || user.firstName,
          lastName: detailedProfile?.lastName || user.lastName,
          email: detailedProfile?.email || user.email,
        };
        
        console.log('Merged userInfo:', mergedUserInfo);
        setUserInfo(mergedUserInfo);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to basic user info
        setUserInfo(user);
      }
    };

    fetchUserProfile();
  }, [navigate, isAuthenticated, isParent, user]);

  // Separate useEffect to handle URL parameter changes
  useEffect(() => {
    // If there are missing health profiles, force to health-profile-declaration
    if (studentsMissingHealthProfile.length > 0) {
      setActiveSection("health-profile-declaration");
      if (!searchParams.get("tab") || searchParams.get("tab") !== "health-profile-declaration") {
        navigate("/parent-dashboard?tab=health-profile-declaration", { replace: true });
      }
      return;
    }

    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const validTabs = [
        "overview",
        "notifications",
        "health-history",
        "health-check-results",
        "medication",
        "vaccination",
        "profile",
        "health-profile-declaration"
      ];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      }
    } else {
      // If no tab parameter, default to overview
      setActiveSection("overview");
    }
  }, [searchParams, studentsMissingHealthProfile, navigate]);  // Function to handle profile updates
  const handleProfileUpdate = (updatedProfile) => {
    console.log("Profile updated in parent dashboard:", updatedProfile);

    // Create a merged object with all fields
    const mergedUserInfo = {
      ...userInfo,
      ...updatedProfile,
      // Ensure critical fields are always included
      firstName: updatedProfile.firstName || userInfo.firstName,
      lastName: updatedProfile.lastName || userInfo.lastName,
      email: updatedProfile.email || userInfo.email,
      phone: updatedProfile.phone || userInfo.phone,
      // Optional fields that might be null
      address: updatedProfile.address || userInfo.address,
      jobTitle: updatedProfile.jobTitle || userInfo.jobTitle,
      dateOfBirth: updatedProfile.dateOfBirth || userInfo.dateOfBirth,
    };

    console.log("Updated user info:", mergedUserInfo);
    setUserInfo(mergedUserInfo);
  };

  // Handle missing health profile modal (now only for navigation)
  const handleCreateHealthProfile = () => {
    setShowMissingHealthProfileModal(false);
    setActiveSection("health-profile-declaration");
    navigate("/parent-dashboard?tab=health-profile-declaration");
  };

  // Refresh missing health profiles check
  const refreshMissingHealthProfiles = async () => {
    if (!isAuthenticated || !isParent() || !getToken()) return;

    try {
      const studentsMissing = await parentApi.getStudentsMissingHealthProfiles(getToken());
      setStudentsMissingHealthProfile(studentsMissing || []);
      if (!studentsMissing || studentsMissing.length === 0) {
        setShowMissingHealthProfileModal(false);
      }
    } catch (error) {
      console.error('Error refreshing missing health profiles:', error);
    }
  };
  const renderContent = () => {
    // Force health profile declaration if there are missing profiles
    if (studentsMissingHealthProfile.length > 0) {
      return <HealthProfileDeclaration onProfileCreated={refreshMissingHealthProfiles} />;
    }

    switch (activeSection) {
      case "overview":
        return <Overview userInfo={userInfo} />;
      case "notifications":
        return <Notifications />;
      case "health-profile-declaration":
        return <HealthProfileDeclaration onProfileCreated={refreshMissingHealthProfiles} />;
      case "health-history":
        return <ApprovedHealthProfile userInfo={userInfo} />;
      case "health-check-results":
        return <HealthCheckResults userInfo={userInfo} />;
      case "medication":
        return <MedicationManagement userInfo={userInfo} />;
      case "vaccination":
        return <VaccinationSchedule />;
      case "profile":
        return (
          <Profile userInfo={userInfo} onProfileUpdate={handleProfileUpdate} />
        );
      default:
        return <Overview userInfo={userInfo} />;
    }
  };

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
    <Layout
      style={{
        minHeight: "calc(100vh - 140px)",
        background: "#f4f6fb",
        margin: "90px 20px 30px 20px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
      }}
    >
      {" "}
      <Sider
        width={240}
        collapsed={collapsed}
        theme="light"
        className="parent-sidebar"
        style={{
          borderRight: "1px solid #f0f0f0",
          background: "#fff",
          zIndex: 10,
          paddingTop: 24,
          position: "relative",
        }}
        trigger={null}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#e6f7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #1976d2",
            }}
          >
            <UserOutlined style={{ fontSize: 32, color: "#1976d2" }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 600,
                color: "#1976d2",
                fontSize: 18,
                marginTop: 12,
                borderRadius: 20,
                padding: "4px 12px",
                background: "#e6f7ff",
              }}
            >
              Phụ huynh
            </span>
          )}
        </div>{" "}
        <Menu
          theme="light"
          selectedKeys={[activeSection]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: "none", fontWeight: 500, fontSize: 16 }}
        />
        {/* Custom Sidebar Trigger Button - Right after menu */}
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
        {/* Blocking overlay when health profiles are missing */}
        {studentsMissingHealthProfile.length > 0 && activeSection !== "health-profile-declaration" && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div>
              <div style={{ marginBottom: '20px' }}>🚫 TÍNH NĂNG BỊ KHÓA</div>
              <div style={{ fontSize: '16px', fontWeight: 'normal' }}>
                Bạn phải hoàn thành khai báo hồ sơ y tế trước khi sử dụng tính năng này
              </div>
            </div>
          </div>
        )}
        <Header
          style={{
            background: studentsMissingHealthProfile.length > 0 ? "#fff2f0" : "#fff",
            padding: "16px 32px",
            height: "auto",
            lineHeight: "normal",
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            borderBottom: studentsMissingHealthProfile.length > 0 ? "2px solid #ff4d4f" : "1px solid #f0f0f0",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ flex: 1 }}>
            {studentsMissingHealthProfile.length > 0 && (
              <div style={{ 
                backgroundColor: '#ff4d4f', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                marginBottom: '8px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                ⚠️ BẮT BUỘC: Bạn phải khai báo hồ sơ y tế cho {studentsMissingHealthProfile.length} học sinh trước khi sử dụng các tính năng khác!
              </div>
            )}
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ fontSize: 14, marginBottom: 4 }}
            />
            <h1
              style={{
                color: studentsMissingHealthProfile.length > 0 ? "#cf1322" : "#1976d2",
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {studentsMissingHealthProfile.length > 0 ? "KHAI BÁO HỒ SƠ Y TẾ BẮT BUỘC" : "Bảng điều khiển phụ huynh"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #1976d2",
              }}
            >
              <UserOutlined style={{ fontSize: 20, color: "#1976d2" }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.lastName || ""} {userInfo?.firstName || ""}
            </span>
          </div>
        </Header>
        <Content
          style={{
            margin: "16px 24px 24px 24px",
            padding: 0,
            minHeight: "calc(100vh - 260px)",
            background: "transparent",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>

      {/* Missing Health Profile Modal */}
      <MissingHealthProfileModal
        visible={showMissingHealthProfileModal}
        students={studentsMissingHealthProfile}
        onCreateProfile={handleCreateHealthProfile}
      />
    </Layout>
  );
};

export default ParentDashboard;
