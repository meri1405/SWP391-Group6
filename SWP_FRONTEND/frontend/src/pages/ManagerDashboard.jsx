import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, Menu, Badge, notification } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  TeamOutlined,
  DashboardOutlined,
  ProfileOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import ManagerVaccinationManagement from "../components/dashboard/ManagerVaccinationManagement";
import ManagerHealthCheckManagement from "../components/dashboard/ManagerHealthCheckManagement";
import ManagerOverview from "../components/dashboard/ManagerOverview";
import ManagerProfile from "../components/dashboard/ManagerProfile";
import { MedicalEventManagement } from "../components/dashboard/events";
import InventorySection from "../components/dashboard/InventorySection";
import { Notifications } from "../components/dashboard/notifications";
import StudentsSection from "../components/dashboard/StudentsSection";
import managerApi from "../api/managerApi";
import "../styles/ManagerDashboard.css";
import { useAuth } from "../contexts/AuthContext";
import { restockRequestApi } from "../api/restockRequestApi";
import webSocketService from "../services/webSocketService";

const { Header, Sider, Content } = Layout;

const ManagerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notificationCount, setNotificationCount] = useState(0);
  const [api, notificationContextHolder] = notification.useNotification();
  const [userInfo, setUserInfo] = useState(null);
  const { user, isAuthenticated, isManager, getToken } = useAuth();

  // Function to update notification count
  const updateNotificationCount = useCallback(async () => {
    if (!user) return;

    try {
      // Use the manager API to fetch unread notification count
      const data = await managerApi.getUnreadNotificationCount();
      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
      // Default to 0 on error
      setNotificationCount(0);
    }
  }, [user]);

  // Fetch detailed user profile from API
  useEffect(() => {
    // Redirect if not authenticated or not a manager
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isManager()) {
      message.error("Bạn không có quyền truy cập vào trang này");
      navigate("/");
      return;
    }

    // Fetch detailed user profile from API
    const fetchUserProfile = async () => {
      if (!user?.id || !getToken()) return;
      
      try {
        console.log('Fetching detailed manager profile');
        const detailedProfile = await managerApi.getManagerProfile();
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
  }, [navigate, isAuthenticated, isManager, user, getToken]);

  // Subscribe to restock request notifications
  useEffect(() => {
    // Initial notification count
    updateNotificationCount();

    // Connect to WebSocket if necessary
    const connectWebSocket = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("[ManagerDashboard] Checking WebSocket connection...");
        try {
          if (!webSocketService.isConnected()) {
            console.log("[ManagerDashboard] Connecting to WebSocket...");
            await webSocketService.connect(token);
            console.log("[ManagerDashboard] WebSocket connected successfully");
          } else {
            console.log("[ManagerDashboard] WebSocket already connected");
          }
        } catch (error) {
          console.error(
            "[ManagerDashboard] Failed to connect to WebSocket:",
            error
          );
        }
      }
    };

    // Connect to WebSocket
    connectWebSocket();

    // Subscribe to restock request updates
    console.log("[ManagerDashboard] Subscribing to restock request updates");
    const unsubscribe = restockRequestApi.subscribeToUpdates(() => {
      updateNotificationCount();
    });

    // Subscribe to WebSocket notifications if available
    if (user && webSocketService) {
      console.log("[ManagerDashboard] Adding WebSocket message handler");
      webSocketService.addMessageHandler(
        "managerNotifications",
        (notification) => {
          console.log(
            "[ManagerDashboard] Received WebSocket notification:",
            notification
          );
          if (notification.notificationType === "RESTOCK_REQUEST_NEW") {
            api.info({
              message: notification.title || "Thông báo mới",
              description: notification.message || "Bạn có thông báo mới",
              placement: "topRight",
              onClick: () => {
                setActiveSection("notifications");
                navigate("/manager-dashboard?tab=notifications");
              },
            });

            // Update notification count
            updateNotificationCount();
          }
        }
      );
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe && unsubscribe();
      if (webSocketService) {
        webSocketService.removeMessageHandler("managerNotifications");
      }
    };
  }, [api, navigate, updateNotificationCount, user]);

  // Handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const validTabs = [
        "overview",
        "profile",
        "notifications",
        "students",
        "health-checks",
        "vaccinations",
        "events",
        "inventory",
      ];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      }
    } else {
      // If no tab parameter, default to overview
      setActiveSection("overview");
    }
  }, [searchParams]);

  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "notifications",
      icon: (
        <Badge count={notificationCount} offset={[10, 0]}>
          <BellOutlined />
        </Badge>
      ),
      label: "Thông báo",
    },
    {
      key: "students",
      icon: <UserOutlined />,
      label: "Học sinh",
    },
    {
      key: "health-checks",
      icon: <TeamOutlined />,
      label: "Quản lý đợt khám",
    },
    {
      key: "vaccinations",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý tiêm chủng",
    },
    {
      key: "events",
      icon: <CalendarOutlined />,
              label: "Xử lý sơ cứu",
    },
    {
      key: "inventory",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý kho",
    },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Hồ sơ cá nhân",
    },
    {
      key: 'toggle-sidebar',
      icon: collapsed ? <RightOutlined /> : <LeftOutlined />,
      label: 'Thu gọn',
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;
  
    if (tabKey === 'toggle-sidebar') {
      setCollapsed(!collapsed);
      return;
    }
  
    setActiveSection(tabKey);
    navigate(`/manager-dashboard?tab=${tabKey}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <ManagerOverview />;
      case "notifications":
        return <Notifications role="manager" />;
      case "students":
        return <StudentsSection />;
      case "health-checks":
        return <ManagerHealthCheckManagement />;
      case "vaccinations":
        return <ManagerVaccinationManagement />;
      case "events":
        return <MedicalEventManagement />;
      case "inventory":
        return <InventorySection />;
      case "profile":
        return <ManagerProfile />;
      default:
        return null;
    }
  };

  return (
    <Layout
      style={{
        minHeight: "calc(100vh - 140px)",
        background: "#f4f6fb",
        margin: "90px 19px 30px 20px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 1,
      }}
    >
      {notificationContextHolder}
      <Sider
        width={240}
        collapsed={collapsed}
        theme="light"
        className="admin-sidebar"
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
              background: "#fff2e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ff4d4f",
            }}
          >
            <MedicineBoxOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 600,
                color: "#ff4d4f",
                fontSize: 18,
                marginTop: 12,
                borderRadius: 20,
                padding: "4px 12px",
                background: "#fff2e8",
              }}
            >
              {userInfo?.lastName || user?.lastName} {userInfo?.firstName || user?.firstName}
            </span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeSection]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ border: "none", fontWeight: 500, fontSize: 16 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 0 }}>
        <Header
          style={{
            background: "#fff",
            padding: "16px 32px",
            height: "auto",
            lineHeight: "normal",
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              color: "#ff4d4f",
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Bảng điều khiển quản lý
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#fff2e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ff4d4f",
              }}
            >
              <UserOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.lastName || user?.lastName} {userInfo?.firstName || user?.firstName}
            </span>
          </div>
        </Header>
        <Content
          className="admin-dashboard-content"
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
    </Layout>
  );
};

export default ManagerDashboard;
