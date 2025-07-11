import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, Spin, message } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/admin/UserManagement';
import AdminProfileCustom from '../components/AdminProfileCustom';
import SettingsManagement from '../components/admin/SettingsManagement';
import '../styles/AdminDashboard.css';
import '../styles/AdminComponents.css';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [userInfo, setUserInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, isAuthenticated, isStaff } = useAuth();

  // Authentication and authorization check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStaff()) {
      message.error('Bạn không có quyền truy cập vào trang này');
      navigate('/');
      return;
    }

    setUserInfo(user);
  }, [navigate, isAuthenticated, isStaff, user]);

  // Handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const validTabs = ['users', 'profile', 'settings'];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      }
    } else {
      setActiveSection('users');
    }
  }, [searchParams]);

  // Handle profile update callback
  const handleProfileUpdate = async (updatedProfile) => {
    console.log('Profile updated:', updatedProfile);
    setUserInfo(prev => ({
      ...prev,
      ...updatedProfile,
    }));
  };

  const getBreadcrumbItems = () => {
    const currentItem = getMenuItems().find(item => item.key === activeSection);
    return [
      { title: 'Dashboard' },
      { title: currentItem?.label || 'Quản lý người dùng' },
    ];
  };

  const getMenuItems = () => [
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Quản lý người dùng',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      key: 'toggle-sidebar',
      icon: collapsed ? <RightOutlined /> : <LeftOutlined />,
      label: 'Thu gọn',
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;

    // Handle sidebar toggle separately
    if (tabKey === 'toggle-sidebar') {
      setCollapsed(!collapsed);
      return;
    }

    setActiveSection(tabKey);
    navigate(`/admin/dashboard?tab=${tabKey}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'profile':
        return (
          <AdminProfileCustom
            userInfo={userInfo}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case 'settings':
        return <SettingsManagement />;
      default:
        return <UserManagement />;
    }
  };

  // Loading state check
  if (!userInfo) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f4f6fb',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout
      className="admin-dashboard"
      style={{
        minHeight: 'calc(100vh - 140px)',
        background: '#f4f6fb',
        margin: '90px 19px 30px 20px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Sider
        width={240}
        collapsed={collapsed}
        theme="light"
        className="admin-sidebar"
        style={{
          borderRight: '1px solid #f0f0f0',
          background: '#fff',
          zIndex: 10,
          paddingTop: 24,
          position: 'relative',
        }}
        trigger={null}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 24,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#fff2e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ff6b35',
            }}
          >
            <SettingOutlined style={{ fontSize: 32, color: '#ff6b35' }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 600,
                color: '#ff6b35',
                fontSize: 18,
                marginTop: 12,
                borderRadius: 20,
                padding: '4px 12px',
                background: '#fff2e8',
              }}
            >
              Quản trị viên
            </span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeSection]}
          onClick={handleMenuClick}
          items={getMenuItems()}
          style={{ border: 'none', fontWeight: 500, fontSize: 16 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 0 }}>
        <Header
          style={{
            background: '#fff',
            padding: '16px 32px',
            height: 'auto',
            lineHeight: 'normal',
            minHeight: 80,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ fontSize: 14, marginBottom: 4 }}
            />
            <h1
              style={{
                color: '#ff6b35',
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              Bảng điều khiển quản trị viên
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fff2e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ff6b35',
              }}
            >
              <UserOutlined style={{ fontSize: 20, color: '#ff6b35' }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.lastName || ''} {userInfo?.firstName || ''}
            </span>
          </div>
        </Header>
        <Content
          style={{
            padding: 0,
            minHeight: 'calc(100vh - 260px)',
            background: 'transparent',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
