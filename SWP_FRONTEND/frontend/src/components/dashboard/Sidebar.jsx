import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { key: 'overview', label: 'Tổng quan', icon: 'fas fa-chart-line' },
    { key: 'notifications', label: 'Thông báo', icon: 'fas fa-bell' },
    { key: 'health-history', label: 'Tiền sử sức khỏe', icon: 'fas fa-notes-medical' },
    { key: 'physical-mental', label: 'Thể lực và tinh thần', icon: 'fas fa-heartbeat' },
    { key: 'medication', label: 'Quản lý thuốc', icon: 'fas fa-pills' },
    { key: 'vaccination', label: 'Lịch tiêm chủng', icon: 'fas fa-syringe' },
    { key: 'profile', label: 'Hồ sơ cá nhân', icon: 'fas fa-user-circle' }
  ];

  const handleMenuClick = (tabKey) => {
    // Update URL with tab parameter
    if (tabKey === 'overview') {
      navigate('/parent-dashboard');
    } else {
      navigate(`/parent-dashboard?tab=${tabKey}`);
    }
    // Also update local state for immediate UI feedback
    setActiveSection(tabKey);
  };
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Quản Lý</h3>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.key)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
