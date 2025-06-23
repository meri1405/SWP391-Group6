import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { parentApi } from "../../../../api/parentApi";
import { nurseApi } from "../../../../api/nurseApi";
import webSocketService from "../../../../services/webSocketService";
import { VaccinationFormModal } from "../vaccinations";
import "../../../../styles/Notifications.css";

const Notifications = ({ role = "parent" }) => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedVaccinationFormId, setSelectedVaccinationFormId] =
    useState(null);
  const { getToken } = useAuth();

  // Use appropriate API based on role
  const api = role === "schoolnurse" ? nurseApi : parentApi;

  // Helper functions for notification processing
  const getNotificationType = (notification) => {
    // Check for medication-related notifications first
    if (notification.medicationRequest || notification.medicationSchedule) {
      return "medication";
    }

    // Check for vaccination notifications
    if (notification.vaccinationFormId) {
      return "vaccination";
    }

    // Check title and message content for additional clues
    const titleLower = notification.title?.toLowerCase() || "";
    const messageLower = notification.message?.toLowerCase() || "";

    // Check for medication keywords
    if (
      titleLower.includes("thuốc") ||
      messageLower.includes("thuốc") ||
      titleLower.includes("medication") ||
      messageLower.includes("medication") ||
      titleLower.includes("dùng thuốc") ||
      messageLower.includes("dùng thuốc")
    ) {
      return "medication";
    }

    // Check for vaccination keywords
    if (
      titleLower.includes("vaccination") ||
      messageLower.includes("vaccination") ||
      titleLower.includes("tiêm chủng") ||
      messageLower.includes("tiêm chủng") ||
      titleLower.includes("vaccine") ||
      messageLower.includes("vaccine") ||
      titleLower.includes("chiến dịch") ||
      messageLower.includes("chiến dịch") ||
      titleLower.includes("campaign") ||
      messageLower.includes("campaign")
    ) {
      return "vaccination";
    }

    return "general";
  };

  const determinePriority = (notification) => {
    // Determine priority based on notification content
    if (
      notification.title?.includes("từ chối") ||
      notification.title?.includes("thất bại")
    ) {
      return "high";
    } else if (
      notification.title?.includes("duyệt") ||
      notification.title?.includes("cập nhật")
    ) {
      return "medium";
    }
    return "low";
  };

  const determineActionRequired = (notification) => {
    // Medication-related notifications usually require some action/attention
    // Vaccination notifications with vaccinationFormId also require action
    return (
      notification.medicationRequest ||
      notification.medicationSchedule ||
      notification.vaccinationFormId
    );
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Không xác định";

    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  };

  // Format notification message to replace ISO dates with Vietnamese format
  const formatNotificationMessage = useCallback((message) => {
    if (!message) return message;

    // Regex to match ISO date format (YYYY-MM-DDTHH:mm or similar)
    const isoDateRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/g;

    // Replace English phrases with Vietnamese equivalents
    let translatedMessage = message
      .replace(/Your vaccination campaign/gi, "Chiến dịch tiêm chủng của bạn")
      .replace(/has been approved by/gi, "đã được phê duyệt bởi")
      .replace(/Campaign Approved/gi, "Chiến dịch được phê duyệt");

    return translatedMessage.replace(isoDateRegex, (match) => {
      try {
        const date = new Date(match);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        const dayNames = [
          "Chủ nhật",
          "Thứ hai",
          "Thứ ba",
          "Thứ tư",
          "Thứ năm",
          "Thứ sáu",
          "Thứ bảy",
        ];
        const dayName = dayNames[date.getDay()];

        return `${dayName}, ngày ${day}/${month}/${year} lúc ${hours}:${minutes}`;
      } catch {
        return match; // Return original if parsing fails
      }
    });
  }, []);

  // Load notifications on component mount
  const loadNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllNotifications(token);

      // Transform backend notification data to frontend format
      const transformedNotifications = data.map((notification) => {
        // Translate notification title if it's in English
        let translatedTitle = notification.title;
        if (translatedTitle === "Campaign Approved") {
          translatedTitle = "Chiến dịch được phê duyệt";
        }

        return {
          id: notification.id,
          type: getNotificationType(notification),
          title: translatedTitle,
          message: formatNotificationMessage(notification.message),
          time: formatTimeAgo(notification.createdAt),
          date: notification.createdAt,
          read: notification.read,
          priority: determinePriority(notification),
          actionRequired: determineActionRequired(notification),
          medicationRequest: notification.medicationRequest,
          medicationSchedule: notification.medicationSchedule,
          vaccinationFormId: notification.vaccinationFormId,
        };
      });

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [getToken, formatNotificationMessage]);

  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket
      await webSocketService.connect(token);
      // Add message handler for real-time notifications
      webSocketService.addMessageHandler("notifications", (newNotification) => {
        // Translate notification title if it's in English
        let translatedTitle = newNotification.title;
        if (translatedTitle === "Campaign Approved") {
          translatedTitle = "Chiến dịch được phê duyệt";
        }

        // Transform the new notification
        const transformedNotification = {
          id: newNotification.id,
          type: getNotificationType(newNotification),
          title: translatedTitle,
          message: formatNotificationMessage(newNotification.message),
          time: "Vừa xong",
          date: newNotification.createdAt,
          read: false,
          priority: determinePriority(newNotification),
          actionRequired: determineActionRequired(newNotification),
          medicationRequest: newNotification.medicationRequest,
          medicationSchedule: newNotification.medicationSchedule,
          vaccinationFormId: newNotification.vaccinationFormId,
        };

        // Add new notification to the beginning of the list
        setNotifications((prev) => [transformedNotification, ...prev]);
      });
    } catch (error) {
      console.error("Error setting up WebSocket connection:", error);
    }
  }, [getToken, formatNotificationMessage]);

  useEffect(() => {
    loadNotifications();
    setupWebSocketConnection();

    return () => {
      // Cleanup WebSocket connection when component unmounts
      webSocketService.removeMessageHandler("notifications");
    };
  }, [loadNotifications, setupWebSocketConnection, api]);

  // Helper functions for formatting
  const formatVietnameseDate = useCallback((dateString) => {
    if (!dateString) return dateString;

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      // Vietnamese day names
      const dayNames = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
      ];
      const dayName = dayNames[date.getDay()];

      return `${dayName}, ngày ${day}/${month}/${year} lúc ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  }, []);
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "action") return notification.actionRequired;
    return notification.type === filter;
  });
  const markAsRead = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      await api.markNotificationAsRead(id, token);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  const confirmAction = (notification) => {
    // Handle different types of confirmations based on notification type
    if (notification.medicationRequest) {
      // Redirect to medication request details
      console.log(
        "Viewing medication request:",
        notification.medicationRequest.id
      );
    } else if (notification.medicationSchedule) {
      // Redirect to medication schedule details
      console.log(
        "Viewing medication schedule:",
        notification.medicationSchedule.id
      );
    } else if (notification.vaccinationFormId) {
      // Open vaccination form modal
      setSelectedVaccinationFormId(notification.vaccinationFormId);
      setShowVaccinationModal(true);
    }

    // Mark as read when action is taken
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleVaccinationFormUpdated = () => {
    // Refresh notifications when vaccination form is updated
    loadNotifications();
  };
  const getTypeIcon = (type) => {
    switch (type) {
      case "vaccination":
        return "fas fa-syringe";
      case "health":
        return "fas fa-heartbeat";
      case "medication":
        return "fas fa-pills";
      case "medical-event":
        return "fas fa-ambulance";
      case "alert":
        return "fas fa-exclamation-triangle";
      default:
        return "fas fa-info-circle";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#2196f3";
    }
  };

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>Thông Báo</h2>
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            className={filter === "unread" ? "active" : ""}
            onClick={() => setFilter("unread")}
          >
            Chưa đọc ({notifications.filter((n) => !n.read).length})
          </button>
          <button
            className={filter === "action" ? "active" : ""}
            onClick={() => setFilter("action")}
          >
            Cần xử lý ({notifications.filter((n) => n.actionRequired).length})
          </button>{" "}
          <button
            className={filter === "medication" ? "active" : ""}
            onClick={() => setFilter("medication")}
          >
            Thuốc
          </button>{" "}
          <button
            className={filter === "vaccination" ? "active" : ""}
            onClick={() => setFilter("vaccination")}
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
      {!loading && !error && (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                !notification.read ? "unread" : ""
              }`}
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
                  {notification.priority === "high" && (
                    <span className="priority-badge high">Khẩn cấp</span>
                  )}
                </div>
                {!notification.read && <div className="unread-dot"></div>}
              </div>{" "}
              <div className="notification-body">
                <p>{notification.message}</p>

                {/* Additional details based on notification type */}
                {notification.medicationRequest && (
                  <div className="notification-details">
                    <div className="detail-item">
                      <strong>Học sinh:</strong>{" "}
                      {notification.medicationRequest.studentName ||
                        "Không xác định"}
                    </div>
                    <div className="detail-item">
                      <strong>Trạng thái:</strong>
                      <span
                        className={`status-badge ${notification.medicationRequest.status?.toLowerCase()}`}
                      >
                        {notification.medicationRequest.status ||
                          "Không xác định"}
                      </span>
                    </div>
                  </div>
                )}
                {notification.medicationSchedule && (
                  <div className="notification-details">
                    <div className="detail-item">
                      <strong>Lịch uống thuốc:</strong>{" "}
                      {notification.medicationSchedule.medicationName ||
                        "Không xác định"}
                    </div>
                    <div className="detail-item">
                      <strong>Thời gian:</strong>{" "}
                      {notification.medicationSchedule.scheduleTime ||
                        "Không xác định"}
                    </div>
                  </div>
                )}
                {/* Show formatted date */}
                <div className="notification-timestamp">
                  <i className="fas fa-clock"></i>
                  <span>{formatVietnameseDate(notification.date)}</span>
                </div>
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
                    onClick={() => confirmAction(notification)}
                  >
                    Xem chi tiết
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && filteredNotifications.length === 0 && (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <h3>Không có thông báo</h3>
          <p>Không có thông báo nào phù hợp với bộ lọc đã chọn.</p>
        </div>
      )}{" "}
      {/* Vaccination Form Modal */}
      {showVaccinationModal && (
        <VaccinationFormModal
          isOpen={showVaccinationModal}
          vaccinationFormId={selectedVaccinationFormId}
          onClose={() => setShowVaccinationModal(false)}
          onFormUpdated={handleVaccinationFormUpdated}
        />
      )}
    </div>
  );
};

export default Notifications;
