import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Button,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  FileTextOutlined,
  TeamOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import ConsultationsSection from "../components/dashboard/ConsultationsSection";
import HealthChecksSection from "../components/dashboard/HealthChecksSection";
import ManagerVaccinationManagement from "../components/dashboard/ManagerVaccinationManagement";
import ManagerHealthCheckManagement from "../components/dashboard/ManagerHealthCheckManagement";
import ManagerOverview from "../components/dashboard/ManagerOverview";
import MedicalEventsSection from "../components/dashboard/MedicalEventsSection";
import InventorySection from "../components/dashboard/InventorySection";
import NotificationsSection from "../components/dashboard/NotificationsSection";
import { Notifications } from "../components/dashboard/notifications";
import BlogSection from "../components/dashboard/BlogSection";
import StudentsSection from "../components/dashboard/StudentsSection";
import "../styles/AdminDashboard.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ManagerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const validTabs = [
        "overview",
        "notifications", 
        "students",
        "consultations",
        "health-checks",
        "vaccinations",
        "events",
        "inventory",
        "notifications-management",
        "blog"
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
      icon: <BellOutlined />,
      label: "Thông báo",
    },
    {
      key: "students",
      icon: <UserOutlined />,
      label: "Học sinh",
    },
    {
      key: "consultations",
      icon: <UserOutlined />,
      label: "Tư vấn sức khỏe",
    },
    {
      key: "health-checks",
      icon: <TeamOutlined />,
      label: "Quản lý khám sức khỏe",
    },
    {
      key: "vaccinations",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý tiêm chủng",
    },
    {
      key: "events",
      icon: <CalendarOutlined />,
      label: "Sự kiện y tế",
    },
    {
      key: "inventory",
      icon: <MedicineBoxOutlined />,
      label: "Quản lý kho",
    },
    {
      key: "notifications-management",
      icon: <BellOutlined />,
      label: "Quản lý thông báo",
    },
    {
      key: "blog",
      icon: <FileTextOutlined />,
      label: "Bài viết",
    },
  ];

  const handleMenuClick = ({ key }) => {
    setActiveSection(key);
    if (key === "overview") {
      navigate("/manager-dashboard");
    } else {
      navigate(`/manager-dashboard?tab=${key}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <ManagerOverview />;
      case "notifications":
        return <Notifications role="manager" />;
      case "students":
        return <StudentsSection />;
      case "consultations":
        return <ConsultationsSection />;
      case "health-checks":
        return <ManagerHealthCheckManagement />;
      case "vaccinations":
        return <ManagerVaccinationManagement />;
      case "events":
        return <MedicalEventsSection />;
      case "inventory":
        return <InventorySection />;
      case "notifications-management":
        return <NotificationsSection />;
      case "blog":
        return <BlogSection />;
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
      {contextHolder}
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
              border: "2px solid #ff6b35",
            }}
          >
            <MedicineBoxOutlined style={{ fontSize: 32, color: "#ff6b35" }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 600,
                color: "#ff6b35",
                fontSize: 18,
                marginTop: 12,
                borderRadius: 20,
                padding: "4px 12px",
                background: "#fff2e8",
              }}
            >
              Quản lý y tế
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
              color: "#ff6b35",
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
                border: "1px solid #ff6b35",
              }}
            >
              <UserOutlined style={{ fontSize: 20, color: "#ff6b35" }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>Quản lý y tế</span>
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
