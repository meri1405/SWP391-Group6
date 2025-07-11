import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Spin,
  message,
  Badge,
  notification,
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
  MailOutlined,
  BellOutlined,
} from "@ant-design/icons";
import NurseMedicationRequests from "../components/dashboard/NurseMedicationRequests";
import NurseMedicationSchedules from "../components/dashboard/NurseMedicationSchedules";
import { VaccinationRuleManagement } from "../components/dashboard/vaccinations";
import { MedicalSupplyInventory } from "../components/dashboard/inventory";
import { Notifications } from "../components/dashboard/notifications";
// Import webSocketService
import { restockRequestApi } from "../api/restockRequestApi";
import webSocketService from "../services/webSocketService";
import NurseProfile from "../components/dashboard/profile";
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
import { MedicalEventManagement } from "../components/dashboard/events";
// Import the campaign management components
import VaccinationCampaignManagement from "../components/schoolnurse/vaccinationCampaign/VaccinationCampaignManagement";
import { HealthCheckCampaignManagement } from "../components/schoolnurse/healthCheck";
import { nurseApi } from "../api/nurseApi";

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
  const { user, isAuthenticated, isSchoolNurse, refreshSession } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfoState] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  const [notificationCount, setNotificationCount] = useState(0);
  const [api, notificationContextHolder] = notification.useNotification();

  // Function to update notification count from API
  const updateNotificationCount = useCallback(async () => {
    if (!user) return;

    try {
      // Refresh session before fetching notifications
      const refreshResult = await refreshSession();
      if (!refreshResult) {
        // Handle silently if session refresh fails
        return;
      }

      // Use nurseApi instead of direct fetch
      const data = await nurseApi.getUnreadNotificationCount();
      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error silently
        return;
      }
      // Default to 0 on error
      setNotificationCount(0);
    }
  }, [user, refreshSession]);

  // Subscribe to restock request notifications
  useEffect(() => {
    // Initial notification count
    updateNotificationCount();

    // Connect to WebSocket if necessary
    const connectWebSocket = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("[SchoolNurseDashboard] Checking WebSocket connection...");
        try {
          if (!webSocketService.isConnected()) {
            console.log("[SchoolNurseDashboard] Connecting to WebSocket...");
            await webSocketService.connect(token);
            console.log(
              "[SchoolNurseDashboard] WebSocket connected successfully"
            );
          } else {
            console.log("[SchoolNurseDashboard] WebSocket already connected");
          }
        } catch (error) {
          console.error(
            "[SchoolNurseDashboard] Failed to connect to WebSocket:",
            error
          );
        }
      }
    };

    // Connect to WebSocket
    connectWebSocket();

    // Subscribe to restock request updates
    console.log(
      "[SchoolNurseDashboard] Subscribing to restock request updates"
    );
    const unsubscribe = restockRequestApi.subscribeToUpdates(async () => {
      // Update notification count
      console.log("[SchoolNurseDashboard] Received restock request update");
      try {
        await refreshSession();
        await updateNotificationCount();
      } catch (error) {
        console.error(
          "[SchoolNurseDashboard] Error handling restock request update:",
          error
        );
      }
    });

    // Subscribe to WebSocket notifications if available
    if (user && webSocketService) {
      console.log("[SchoolNurseDashboard] Adding WebSocket message handler");
      webSocketService.addMessageHandler(
        "nurseNotifications",
        async (notification) => {
          console.log(
            "[SchoolNurseDashboard] Received WebSocket notification:",
            notification
          );

          if (
            notification.notificationType === "RESTOCK_REQUEST_APPROVED" ||
            notification.notificationType === "RESTOCK_REQUEST_REJECTED"
          ) {
            // Determine message based on notification type
            const title =
              notification.notificationType === "RESTOCK_REQUEST_APPROVED"
                ? "Yêu cầu nhập kho được duyệt"
                : "Yêu cầu nhập kho bị từ chối";

            api.info({
              message: notification.title || title,
              description:
                notification.message ||
                "Kiểm tra thông tin chi tiết trong mục thông báo",
              placement: "topRight",
              onClick: () => {
                setActiveSection("notifications");
                navigate("/school-nurse-dashboard?tab=notifications");
              },
            });

            // Update notification count
            try {
              await refreshSession();
              await updateNotificationCount();
            } catch (error) {
              console.error(
                "[SchoolNurseDashboard] Error updating notification count:",
                error
              );
            }
          }
        }
      );
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe && unsubscribe();
      if (webSocketService) {
        webSocketService.removeMessageHandler("nurseNotifications");
      }
    };
  }, [api, navigate, updateNotificationCount, user, refreshSession]);

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
      icon:
        notificationCount > 0 ? (
          <Badge
            count={notificationCount}
            size="small"
            style={{
              backgroundColor: "#ff4d4f",
            }}
          >
            <BellOutlined />
          </Badge>
        ) : (
          <BellOutlined />
        ),
      label: "Thông báo",
    },
    {
      key: "medication-requests",
      icon: <FileDoneOutlined />,
      label: "Quản lý gửi thuốc",
    },
    {
      key: "medication-schedules",
      icon: <ClockCircleOutlined />,
      label: "Lịch uống thuốc",
    },
    {
      key: "events",
      icon: <AlertOutlined />,
      label: "Xử lý sơ cứu",
    },
    {
      key: "inventory",
      icon: <InboxOutlined />,
      label: "Giám sát tồn kho",
    },
    {
      key: "restock-requests",
      icon: <MailOutlined />,
      label: "Bổ sung vật tư",
    },
    {
      key: "vaccination",
      icon: <CalendarOutlined />,
      label: "Chiến dịch tiêm chủng",
    },
    {
      key: "vaccination-rule-management",
      icon: <MedicineBoxOutlined />,
      label: "Quy tắc tiêm chủng",
    },
    {
      key: "health-check",
      icon: <HeartOutlined />,
      label: "Đợt khám sức khỏe",
    },
    {
      key: "health-records",
      icon: <FileTextOutlined />,
      label: "Hồ sơ y tế",
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
      <HealthCheckCampaignManagement />
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
      import("../components/dashboard/inventory")
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
        return <NurseProfile />;
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
      {notificationContextHolder}
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
            <h1 className="nurse-header-title">
              Bảng điều khiển Y tá Trường học
            </h1>
          </div>

          <div className="nurse-header-user">
            <div className="nurse-header-avatar">
              <UserOutlined style={{ fontSize: 20, color: "#1976d2" }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.lastName || ""} {userInfo?.firstName || ""}
            </span>
          </div>
        </Header>

        <Content className="nurse-content">{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default SchoolNurseDashboard;
