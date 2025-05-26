import React, { useState } from 'react';
import '../../styles/Notifications.css';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  
  const notifications = [
    {
      id: 1,
      type: 'vaccination',
      title: 'Lịch tiêm phòng sắp tới',
      message: 'Con em bạn Nguyễn Văn An có lịch tiêm phòng vào ngày 30/05/2025 lúc 8:00 AM. Vui lòng chuẩn bị đầy đủ giấy tờ và đưa trẻ đến đúng giờ.',
      time: '2 giờ trước',
      date: '2025-05-25',
      read: false,
      priority: 'high',
      actionRequired: true
    },
    {
      id: 2,
      type: 'health',
      title: 'Kết quả khám sức khỏe định kỳ',
      message: 'Kết quả khám sức khỏe định kỳ của con em Nguyễn Thị Bình đã có. Tình trạng sức khỏe tổng thể tốt, cần theo dõi thêm về dinh dưỡng.',
      time: '1 ngày trước',
      date: '2025-05-24',
      read: true,
      priority: 'medium',
      actionRequired: false
    },
    {
      id: 3,
      type: 'medication',
      title: 'Nhắc nhở uống thuốc',
      message: 'Đã đến giờ cho con em uống thuốc vitamin D. Liều lượng: 1 viên sau bữa sáng.',
      time: '2 ngày trước',
      date: '2025-05-23',
      read: true,
      priority: 'low',
      actionRequired: true
    },
    {
      id: 4,
      type: 'general',
      title: 'Thông báo từ y tá trường',
      message: 'Trường tổ chức chương trình khám sức khỏe miễn phí cho học sinh vào tuần tới. Phụ huynh cần đăng ký trước.',
      time: '3 ngày trước',
      date: '2025-05-22',
      read: false,
      priority: 'medium',
      actionRequired: true
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'action') return notification.actionRequired;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    // API call to mark notification as read
    console.log('Marking notification as read:', id);
  };

  const confirmAction = (id) => {
    // API call to confirm action
    console.log('Confirming action for notification:', id);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vaccination': return 'fas fa-syringe';
      case 'health': return 'fas fa-heartbeat';
      case 'medication': return 'fas fa-pills';
      default: return 'fas fa-info-circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>Thông Báo</h2>
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''} 
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({notifications.filter(n => !n.read).length})
          </button>
          <button 
            className={filter === 'action' ? 'active' : ''} 
            onClick={() => setFilter('action')}
          >
            Cần xử lý ({notifications.filter(n => n.actionRequired).length})
          </button>
          <button 
            className={filter === 'vaccination' ? 'active' : ''} 
            onClick={() => setFilter('vaccination')}
          >
            Tiêm chủng
          </button>
          <button 
            className={filter === 'health' ? 'active' : ''} 
            onClick={() => setFilter('health')}
          >
            Sức khỏe
          </button>
          <button 
            className={filter === 'medication' ? 'active' : ''} 
            onClick={() => setFilter('medication')}
          >
            Thuốc
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-card ${!notification.read ? 'unread' : ''}`}
          >
            <div className="notification-header">
              <div className="notification-icon">
                <i 
                  className={getTypeIcon(notification.type)}
                  style={{ color: getPriorityColor(notification.priority) }}
                ></i>
              </div>
              <div className="notification-meta">
                <h3>{notification.title}</h3>
                <span className="notification-time">{notification.time}</span>
                {notification.priority === 'high' && (
                  <span className="priority-badge high">Khẩn cấp</span>
                )}
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
            
            <div className="notification-body">
              <p>{notification.message}</p>
            </div>

            <div className="notification-actions">
              {!notification.read && (
                <button 
                  className="action-btn secondary"
                  onClick={() => markAsRead(notification.id)}
                >
                  Đánh dấu đã đọc
                </button>
              )}
              {notification.actionRequired && (
                <button 
                  className="action-btn primary"
                  onClick={() => confirmAction(notification.id)}
                >
                  Xác nhận
                </button>
              )}
              <button className="action-btn secondary">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>Không có thông báo</h3>
          <p>Không có thông báo nào phù hợp với bộ lọc đã chọn.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
