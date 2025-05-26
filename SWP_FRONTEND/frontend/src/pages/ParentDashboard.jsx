import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Notifications from '../components/dashboard/Notifications';
import HealthHistory from '../components/dashboard/HealthHistory';
import PhysicalMental from '../components/dashboard/PhysicalMental';
import MedicationManagement from '../components/dashboard/MedicationManagement';
import VaccinationSchedule from '../components/dashboard/VaccinationSchedule';
import Profile from '../components/dashboard/Profile';
import '../styles/ParentDashboard.css';

const ParentDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="parent-dashboard">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="content-header">
          <h1>Phụ Huynh</h1>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
