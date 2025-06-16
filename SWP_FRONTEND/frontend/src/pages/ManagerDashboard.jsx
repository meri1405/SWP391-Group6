import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Avatar, Typography, Button, message } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    BellOutlined,
    FileTextOutlined,
    TeamOutlined,
    LogoutOutlined,
    DashboardOutlined,
    LeftOutlined,
    RightOutlined,
    UsergroupAddOutlined
} from '@ant-design/icons';
import ConsultationsSection from '../components/dashboard/ConsultationsSection';
import HealthChecksSection from '../components/dashboard/HealthChecksSection';
import VaccinationSchedule from '../components/dashboard/VaccinationSchedule';
import MedicalEventsSection from '../components/dashboard/MedicalEventsSection';
import InventorySection from '../components/dashboard/InventorySection';
import NotificationsSection from '../components/dashboard/NotificationsSection';
import BlogSection from '../components/dashboard/BlogSection';
import StudentManagement from '../components/dashboard/StudentManagement';
import '../styles/AdminDashboard.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ManagerDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [messageApi, contextHolder] = message.useMessage();

    const menuItems = [
        {
            key: 'overview',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: 'students',
            icon: <UsergroupAddOutlined />,
            label: 'Quản lý học sinh',
        },
        {
            key: 'consultations',
            icon: <UserOutlined />,
            label: 'Tư vấn sức khỏe',
        },
        {
            key: 'health-checks',
            icon: <TeamOutlined />,
            label: 'Khám sức khỏe',
        },
        {
            key: 'vaccinations',
            icon: <MedicineBoxOutlined />,
            label: 'Tiêm chủng',
        },
        {
            key: 'medical-events',
            icon: <CalendarOutlined />,
            label: 'Sự kiện y tế',
        },
        {
            key: 'inventory',
            icon: <MedicineBoxOutlined />,
            label: 'Quản lý kho',
        },
        {
            key: 'notifications',
            icon: <BellOutlined />,
            label: 'Thông báo',
        },
        {
            key: 'blog',
            icon: <FileTextOutlined />,
            label: 'Bài viết',
        },
        {
            key: 'toggle-sidebar',
            icon: collapsed ? <RightOutlined /> : <LeftOutlined />,
            label: 'Thu gọn',
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleMenuClick = (e) => {
        const tabKey = e.key;

        // Handle sidebar toggle separately
        if (tabKey === 'toggle-sidebar') {
            setCollapsed(!collapsed);
            return;
        }

        setActiveSection(tabKey);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="dashboard-overview">
                        <h2>Tổng quan</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>150</h3>
                                    <p>Tổng số học sinh</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>5</h3>
                                    <p>Lịch hẹn hôm nay</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>3</h3>
                                    <p>Khám sức khỏe chờ xử lý</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>2</h3>
                                    <p>Thuốc cần bổ sung</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'students':
                return <StudentManagement />;
            case 'consultations':
                return <ConsultationsSection />;
            case 'health-checks':
                return <HealthChecksSection />;
            case 'vaccinations':
                return <VaccinationSchedule />;
            case 'medical-events':
                return <MedicalEventsSection />;
            case 'inventory':
                return <InventorySection />;
            case 'notifications':
                return <NotificationsSection />;
            case 'blog':
                return <BlogSection />;
            default:
                return null;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {contextHolder}
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
                            <UserOutlined style={{ fontSize: 32, color: "#ff6b35" }} />
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
                        items={menuItems}
                        onClick={handleMenuClick}
                    />
                </Sider>
                <Layout>
                    <Header className="admin-dashboard-header">
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
                            <span style={{ fontWeight: 500, fontSize: 16 }}>
                                Quản lý y tế
                            </span>
                            <Button
                                type="text"
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                style={{ marginLeft: 'auto' }}
                            >
                                Đăng xuất
                            </Button>
                        </div>
                    </Header>
                    <Content className="admin-dashboard-content">
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default ManagerDashboard; 