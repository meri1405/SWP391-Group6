import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi } from '../../api/parentApi';
import webSocketService from '../../services/webSocketService';
import VaccinationFormModal from './VaccinationFormModal';
import '../../styles/Notifications.css';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedVaccinationFormId, setSelectedVaccinationFormId] = useState(null);  const { getToken } = useAuth();
  
  // Helper functions for formatting
  const formatVietnameseDate = useCallback((dateString) => {
    if (!dateString) return dateString;
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  }, []);
  
  const formatNotificationMessage = useCallback((message) => {
    if (!message) return message;
    
    // Regex to find ISO date formats like 2025-06-25T10:30 or 2025-06-25T10:30:00
    const isoDateRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)/g;
    
    return message.replace(isoDateRegex, (match) => {
      return formatVietnameseDate(match);
    });
  }, [formatVietnameseDate]);

  // Load notifications on component mount
  const loadNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await parentApi.getAllNotifications(token);      // Transform backend notification data to frontend format
      const transformedNotifications = data.map(notification => {
        const transformed = {
          id: notification.id,
          type: getNotificationType(notification),
          title: notification.title,
          message: formatNotificationMessage(notification.message),
          time: formatTimeAgo(notification.createdAt),
          date: notification.createdAt,
          read: notification.read,
          priority: determinePriority(notification),
          actionRequired: determineActionRequired(notification),
          confirm: notification.confirm,
          medicationRequest: notification.medicationRequest,
          medicationSchedule: notification.medicationSchedule,
          vaccinationFormId: notification.vaccinationFormId
        };
        return transformed;
      });
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Không thể tải thông báo. Vui lòng thử lại.');    } finally {
      setLoading(false);
    }
  }, [getToken, formatNotificationMessage]);

  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket
      await webSocketService.connect(token);      // Add message handler for real-time notifications
      webSocketService.addMessageHandler('notifications', (newNotification) => {
        // Transform the new notification
        const transformedNotification = {
          id: newNotification.id,
          type: getNotificationType(newNotification),
          title: newNotification.title,
          message: formatNotificationMessage(newNotification.message),
          time: 'Vừa xong',
          date: newNotification.createdAt,
          read: false,
          priority: determinePriority(newNotification),
          actionRequired: determineActionRequired(newNotification),
          medicationRequest: newNotification.medicationRequest,
          medicationSchedule: newNotification.medicationSchedule,
          vaccinationFormId: newNotification.vaccinationFormId
        };
        
        // Add new notification to the beginning of the list
        setNotifications(prev => [transformedNotification, ...prev]);
      });
        } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
    }
  }, [getToken, formatNotificationMessage]);

  useEffect(() => {
    loadNotifications();
    setupWebSocketConnection();
    
    return () => {
      // Cleanup WebSocket connection when component unmounts
      webSocketService.removeMessageHandler('notifications');
    };
  }, [loadNotifications, setupWebSocketConnection]);  const getNotificationType = (notification) => {
    if (notification.medicationRequest) {
      return 'medication';
    } else if (notification.medicationSchedule) {
      return 'medication';
    } else if (notification.vaccinationFormId) {
      return 'vaccination';
    }
    return 'general';
  };

  const determinePriority = (notification) => {
    // High priority for vaccination consent required
    if (notification.confirm === true) {
      return 'high';
    }
    // Determine priority based on notification content
    if (notification.title?.includes('từ chối') || notification.title?.includes('thất bại')) {
      return 'high';
    } else if (notification.title?.includes('duyệt') || notification.title?.includes('cập nhật')) {
      return 'medium';
    }
    return 'low';
  };

  const determineActionRequired = (notification) => {
    // Vaccination consent notifications require action
    if (notification.confirm === true) {
      return true;
    }
    // Medication-related notifications usually require some action/attention
    return notification.medicationRequest || notification.medicationSchedule;
  };
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'action') return notification.actionRequired;
    return notification.type === filter;
  });
  const markAsRead = async (id) => {
    const token = getToken();
    if (!token) return;
    
    try {
      await parentApi.markNotificationAsRead(id, token);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };  const confirmAction = (notification) => {
    // Handle different types of confirmations based on notification type
    if (notification.vaccinationFormId) {
      // Open vaccination form modal for confirmation/decline
      setSelectedVaccinationFormId(notification.vaccinationFormId);
      setShowVaccinationModal(true);
    } else if (notification.medicationRequest) {
      // Redirect to medication request details
    } else if (notification.medicationSchedule) {
      // Redirect to medication schedule details
    }
    
    // Mark as read when action is taken
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };const handleVaccinationFormUpdated = () => {
    // Refresh notifications after form update
    loadNotifications();
    setShowVaccinationModal(false);
    setSelectedVaccinationFormId(null);
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
  };  return (
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
          </button>          <button 
            className={filter === 'medication' ? 'active' : ''} 
            onClick={() => setFilter('medication')}
          >
            Thuốc
          </button>
          <button 
            className={filter === 'vaccination' ? 'active' : ''} 
            onClick={() => setFilter('vaccination')}
          >
            Tiêm chủng
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông báo...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={loadNotifications} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (        <div className="notifications-list">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.read ? 'unread' : ''} ${notification.priority}`}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  <i 
                    className={getTypeIcon(notification.type)}
                    style={{ color: getPriorityColor(notification.priority) }}
                  ></i>
                </div>
                
                <div className="notification-main">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <div className="notification-badges">
                      {notification.priority === 'high' && (
                        <span className="priority-badge high">Khẩn cấp</span>
                      )}
                      {!notification.read && <div className="unread-dot"></div>}
                    </div>
                  </div>
                  
                  <div className="notification-body">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      <i className="fas fa-clock"></i> {notification.time}
                    </span>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="action-btn secondary"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <i className="fas fa-check"></i> Đánh dấu đã đọc
                      </button>
                    )}
                    {(notification.actionRequired || notification.vaccinationFormId) && (
                      <button 
                        className="action-btn primary"
                        onClick={() => confirmAction(notification)}
                      >
                        <i className="fas fa-syringe"></i> 
                        {notification.confirm ? 'Xác nhận tiêm chủng' : 'Xem chi tiết'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredNotifications.length === 0 && (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>Không có thông báo</h3>
          <p>Không có thông báo nào phù hợp với bộ lọc đã chọn.</p>        </div>
      )}

      {/* Vaccination Form Modal */}
      <VaccinationFormModal
        isOpen={showVaccinationModal}
        onClose={() => {
          setShowVaccinationModal(false);
          setSelectedVaccinationFormId(null);
        }}
        vaccinationFormId={selectedVaccinationFormId}
        onFormUpdated={handleVaccinationFormUpdated}
      />
    </div>
  );
};

export default Notifications;
