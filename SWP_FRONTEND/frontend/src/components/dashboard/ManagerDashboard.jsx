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
    DashboardOutlined
} from '@ant-design/icons';
import ConsultationsSection from './ConsultationsSection';
import HealthChecksSection from './HealthChecksSection';
import VaccinationSchedule from './VaccinationSchedule';
import MedicalEventsSection from './MedicalEventsSection';
import InventorySection from './InventorySection';
import NotificationsSection from './NotificationsSection';
import BlogSection from './BlogSection';

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
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng số học sinh"
                                        value={150}
                                        prefix={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Lịch hẹn hôm nay"
                                        value={5}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Khám sức khỏe chờ xử lý"
                                        value={3}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Thuốc cần bổ sung"
                                        value={2}
                                        prefix={<MedicineBoxOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                );
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
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activeSection]}
                    items={menuItems}
                    onClick={({ key }) => setActiveSection(key)}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
                        <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                        <span style={{ marginRight: 16 }}>Quản lý y tế</span>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </Header>
                <Content style={{ margin: '36px 24px', padding: 36, background: '#fff', minHeight: 280 }}>
                    <Title level={4} style={{ marginBottom: 24 }}>
                        {menuItems.find(item => item.key === activeSection)?.label}
                    </Title>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ManagerDashboard; 