import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Overview.css';

const Overview = () => {
  const { isParent } = useAuth();
  
  // Dữ liệu cho đứa trẻ đầu tiên (Nguyễn Văn An)
  const childData = {
    id: 1,
    name: 'Nguyễn Văn An',
    class: 'Lớp 5A',
    status: 'Bình thường',
    lastCheckup: '15/05/2025',
    bmi: '17.9 (35kg / 140cm)'
  };

  // Card data theo đúng thứ tự và nội dung của dashboard mẫu
  const healthSummaryCards = [
    {
      title: 'Nguyễn Văn An',
      subtitle: childData.class,
      icon: 'fas fa-user-graduate',
      color: '#1976d2'
    },
    {
      title: 'Chỉ số BMI',
      value: childData.bmi,
      icon: 'fas fa-weight-scale',
      color: '#2196f3'
    },
    {
      title: 'Tình trạng sức khỏe',
      value: childData.status,
      icon: 'fas fa-file-medical',
      color: '#4caf50'
    },
    {
      title: 'Lịch khám gần nhất',
      value: childData.lastCheckup,
      icon: 'fas fa-calendar-check',
      color: '#ff9800'
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Nhắc lịch khám sức khỏe',
      message: 'Lịch khám sức khỏe định kỳ của bé Nguyễn Văn An vào ngày 15/06/2025',
      time: '21/5/2025',
      read: false
    },
    {
      id: 2,
      type: 'vaccination',
      title: 'Cập nhật tiêm chủng',
      message: 'Nhà trường sẽ tổ chức tiêm vắc-xin phòng cúm vào ngày 30/05/2025',
      time: '20/5/2025',
      read: true
    }
  ];

  return (
    <div className="overview-container">
      <h1 className="main-title">Tổng quan sức khỏe</h1>

      <div className="health-summary-section">
        <div className="health-cards-grid">
          {healthSummaryCards.map((card, index) => (
            <div key={index} className="health-card" style={{ borderColor: card.color }}>
              <div className="health-card-icon" style={{ backgroundColor: card.color }}>
                <i className={card.icon}></i>
              </div>
              <div className="health-card-content">
                <h4>{card.title}</h4>
                {card.subtitle && <p>{card.subtitle}</p>}
                {card.value && <p>{card.value}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Only show notifications section for parents */}
      {isParent() && (
        <div className="notifications-section overview-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-bell"></i>
              Thông báo gần đây
            </h3>
            <button className="view-all-btn">Xem tất cả</button>
          </div>
          <div className="notifications-list">
            {recentNotifications.map(notification => (
              <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
