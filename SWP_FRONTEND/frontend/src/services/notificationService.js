import { parentApi } from "../api/parentApi";
import { nurseApi } from "../api/nurseApi";
import managerApi from "../api/managerApi";
import { cleanNotificationText } from "../utils/htmlUtils";
import { formatTimeAgo } from "../utils/timeUtils";

/**
 * Service for handling notification-related API operations
 */
class NotificationService {
  /**
   * Get appropriate API based on user role
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @returns {Object} - Appropriate API object
   */
  getApiByRole(isSchoolNurse, isManager) {
    if (isSchoolNurse()) {
      return nurseApi;
    } else if (isManager()) {
      return managerApi;
    } else {
      return parentApi;
    }
  }

  /**
   * Load notifications for the current user
   * @param {string} token - Authentication token
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @param {number} limit - Number of notifications to fetch (default: 5)
   * @returns {Object} - Object containing notifications and unread count
   */
  async loadNotifications(token, isSchoolNurse, isManager, limit = 5) {
    if (!token) {
      throw new Error("No authentication token provided");
    }

    const api = this.getApiByRole(isSchoolNurse, isManager);
    
    // Load notifications and unread count in parallel
    const [allData, unreadData] = await Promise.all([
      api.getAllNotifications(token, limit),
      api.getUnreadNotifications(token)
    ]);

    // Transform backend notifications to frontend format
    const transformedNotifications = allData.map((notification) => ({
      id: notification.id,
      title: notification.title,
      text: cleanNotificationText(notification.message, 80),
      time: formatTimeAgo(notification.createdAt),
      icon: this.getNotificationIcon(notification),
      read: notification.read,
    }));

    return {
      notifications: transformedNotifications,
      unreadCount: unreadData.length
    };
  }

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - ID of the notification
   * @param {string} token - Authentication token
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @returns {Promise} - Promise resolving when notification is marked as read
   */
  async markNotificationAsRead(notificationId, token, isSchoolNurse, isManager) {
    if (!token || !notificationId) {
      throw new Error("Missing required parameters");
    }

    const api = this.getApiByRole(isSchoolNurse, isManager);
    return api.markNotificationAsRead(notificationId, token);
  }

  /**
   * Mark multiple notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   * @param {string} token - Authentication token
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @returns {Promise} - Promise resolving when all notifications are marked as read
   */
  async markMultipleNotificationsAsRead(notificationIds, token, isSchoolNurse, isManager) {
    if (!token || !notificationIds?.length) {
      return;
    }

    const api = this.getApiByRole(isSchoolNurse, isManager);
    const promises = notificationIds.map(id => 
      api.markNotificationAsRead(id, token)
    );
    
    return Promise.all(promises);
  }

  /**
   * Get unread notifications count
   * @param {string} token - Authentication token
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @returns {number} - Number of unread notifications
   */
  async getUnreadCount(token, isSchoolNurse, isManager) {
    if (!token) {
      return 0;
    }

    try {
      const api = this.getApiByRole(isSchoolNurse, isManager);
      const unreadData = await api.getUnreadNotifications(token);
      return unreadData.length;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Transform a real-time notification to frontend format
   * @param {Object} notification - Raw notification from WebSocket
   * @returns {Object} - Transformed notification
   */
  transformRealtimeNotification(notification) {
    return {
      id: notification.id,
      title: notification.title,
      text: cleanNotificationText(notification.message, 80),
      time: "Vừa xong",
      icon: this.getNotificationIcon(notification),
      read: false,
    };
  }

  /**
   * Get appropriate icon for notification type
   * @param {Object} notification - Notification object
   * @returns {string} - Icon name for FontAwesome
   */
  getNotificationIcon(notification) {
    if (notification.medicationRequest || notification.medicationSchedule) {
      return "pills";
    }
    return "info-circle";
  }

  /**
   * Check if user can see notifications
   * @param {Object} user - User object
   * @param {Function} isParent - Function to check if user is parent
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @returns {boolean} - Whether user can see notifications
   */
  canUserSeeNotifications(user, isParent, isSchoolNurse, isManager) {
    if (!user) return false;
    
    return (
      (isParent() && user.loginMethod !== "username") || // Parent who logged in via phone
      isSchoolNurse() || // SchoolNurse role
      isManager() // Manager role
    );
  }
}

// Export singleton instance
export default new NotificationService();
