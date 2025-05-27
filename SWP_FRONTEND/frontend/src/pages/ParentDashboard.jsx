import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, Spin } from 'antd';
import {
  DashboardOutlined,
  BellOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import Overview from '../components/dashboard/Overview';
import Notifications from '../components/dashboard/Notifications';
import HealthHistory from '../components/dashboard/HealthHistory';
import PhysicalMental from '../components/dashboard/PhysicalMental';
import MedicationManagement from '../components/dashboard/MedicationManagement';
import VaccinationSchedule from '../components/dashboard/VaccinationSchedule';
import Profile from '../components/dashboard/Profile';

const { Header, Sider, Content } = Layout;

const ParentDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [userInfo, setUserInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const menuItems = [
    {
      key: 'overview',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Thông báo',
    },
    {
      key: 'health-history',
      icon: <FileTextOutlined />,
      label: 'Tiền sử sức khỏe',
    },
    {
      key: 'physical-mental',
      icon: <HeartOutlined />,
      label: 'Thể lực và tinh thần',
    },
    {
      key: 'medication',
      icon: <MedicineBoxOutlined />,
      label: 'Quản lý thuốc',
    },
    {
      key: 'vaccination',
      icon: <CalendarOutlined />,
      label: 'Lịch tiêm chủng',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;
    setActiveSection(tabKey);
    
    if (tabKey === 'overview') {
      navigate('/parent-dashboard');
    } else {
      navigate(`/parent-dashboard?tab=${tabKey}`);
    }
  };

  const getBreadcrumbItems = () => {
    const currentItem = menuItems.find(item => item.key === activeSection);
    return [
      {
        title: 'Dashboard',
      },
      {
        title: currentItem?.label || 'Tổng quan',
      },
    ];
  };
  useEffect(() => {
    // Get user info from localStorage or token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Mock user info - replace with actual API call
    setUserInfo({
      id: 1,
      firstName: 'Nguyễn',
      lastName: 'Thị Lan',
      email: 'nguyenthilan@example.com',
      phone: '+84829079498',
      roleName: 'PARENT'
    });
  }, [navigate]);

  // Separate useEffect to handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const validTabs = ['overview', 'notifications', 'health-history', 'physical-mental', 'medication', 'vaccination', 'profile'];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      }
    } else {
      // If no tab parameter, default to overview
      setActiveSection('overview');
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'notifications':
        return <Notifications />;
      case 'health-history':
        return <HealthHistory />;
      case 'physical-mental':
        return <PhysicalMental />;
      case 'medication':
        return <MedicationManagement />;
      case 'vaccination':
        return <VaccinationSchedule />;
      case 'profile':
        return <Profile userInfo={userInfo} />;
      default:
        return <Overview />;
    }
  };

  if (!userInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f4f6fb' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ 
      minHeight: 'calc(100vh - 140px)', 
      background: '#f4f6fb',
      margin: '90px 20px 30px 20px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
    }}>
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
          background: '#fff',
          zIndex: 10,
          paddingTop: 24,
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 24,
          marginTop: 8
        }}>
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: '#e6f7ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px solid #1976d2'
          }}>
            <UserOutlined style={{ fontSize: 32, color: '#1976d2' }} />
          </div>
          {!collapsed && (
            <span style={{ 
              fontWeight: 600, 
              color: '#1976d2', 
              fontSize: 18, 
              marginTop: 12,
              borderRadius: 20,
              padding: '4px 12px',
              background: '#e6f7ff'
            }}>
              Phụ huynh
            </span>
          )}
        </div>
        <Menu
          theme="light"
          selectedKeys={[activeSection]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', fontWeight: 500, fontSize: 16 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 0 }}>
        <Header style={{
          background: '#fff',
          padding: '16px 32px',
          height: 'auto',
          lineHeight: 'normal',
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
        }}>
          <div style={{ flex: 1 }}>
            <Breadcrumb items={getBreadcrumbItems()} style={{ fontSize: 14, marginBottom: 4 }} />
            <h1 style={{ color: '#1976d2', margin: 0, fontSize: 28, fontWeight: 700 }}>Bảng điều khiển phụ huynh</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #1976d2'
            }}>
              <UserOutlined style={{ fontSize: 20, color: '#1976d2' }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>{userInfo.firstName} {userInfo.lastName}</span>
          </div>
        </Header>
        <Content style={{
          margin: '16px 24px 24px 24px',
          padding: 0,
          minHeight: 'calc(100vh - 260px)',
          background: 'transparent',
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ParentDashboard;
