import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "antd";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import { nurseApi } from "../../../api/nurseApi";
import managerApi from "../../../api/managerApi";
import webSocketService from "../../../services/webSocketService";
import { VaccinationFormModal } from "../vaccinations";
import "../../../styles/Notifications.css";
import { HealthCheckFormModal } from "../health";
const Notifications = ({ role = "parent" }) => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedVaccinationFormId, setSelectedVaccinationFormId] =
    useState(null);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [selectedHealthCheckFormId, setSelectedHealthCheckFormId] =
    useState(null);

  const { getToken } = useAuth();
  
  // Basic styles for notification content
  const notificationContentStyles = {
    content: {
      lineHeight: "1.6",
      fontFamily: "Arial, sans-serif",
    },
    textFallback: {
      margin: "4px 0",
    }
  };

  const convertLocalDateTimeArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return null;
  }
  
  try {
    // Array format: [year, month, day, hour, minute, second, nanosecond]
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    // Note: JavaScript Date month is 0-indexed, but LocalDateTime month is 1-indexed
    return new Date(year, month - 1, day, hour, minute, second);
  } catch (error) {
    console.error('Error converting date array:', error);
    return null;
  }
};

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  // Use a ref to prevent duplicate API calls
  const isLoadingRef = useRef(false);

  // Use appropriate API based on role
  const api =
    role === "schoolnurse"
      ? nurseApi
      : role === "manager"
      ? managerApi
      : parentApi;

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

    if(notification.healthCheckFormId) {
      return "health";
    }

    console.log(notification.healthCheckFormId);

    // Check title and message content for additional clues
    const titleLower = notification.title?.toLowerCase() || "";
    const messageLower = notification.message?.toLowerCase() || "";

    // IMPORTANT: Determine if this is a completion request notification
    // Priority 1: Explicit completion request type with valid ID
    if (
      notification.type === "completion-request" &&
      (notification.campaignCompletionRequestId ||
        (notification.campaignCompletionRequest &&
          notification.campaignCompletionRequest.campaignCompletionRequestId))
    ) {
      return "completion-request";
    }

    // Priority 2: Clear completion request keywords regardless of ID status
    // These are clearly completion requests based on content, even if missing ID due to backend issues
    if (
      titleLower.includes("yêu cầu hoàn thành chiến dịch") ||
      messageLower.includes("yêu cầu hoàn thành chiến dịch") ||
      titleLower.includes("chiến dịch chờ phê duyệt") ||
      messageLower.includes("chiến dịch chờ phê duyệt") ||
      titleLower.includes("chờ duyệt") ||
      messageLower.includes("chờ duyệt")
    ) {
      return "completion-request";
    }

    // Priority 3: Legacy notifications with type "completion-request" but no ID
    if (notification.type === "completion-request") {
      console.warn(
        "Found notification with type 'completion-request' but no valid campaignCompletionRequestId. Still treating as completion-request due to explicit type."
      );
      return "completion-request";
    }

    // Priority 4: General campaign status updates (informational only)
    if (
      titleLower.includes("hoàn thành chiến dịch") ||
      messageLower.includes("hoàn thành chiến dịch") ||
      titleLower.includes("chiến dịch") ||
      messageLower.includes("chiến dịch")
    ) {
      return "status-update";
    }

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

    // Check for health check keywords
    if (
      titleLower.includes("health check") ||
      messageLower.includes("health check") ||
      titleLower.includes("khám sức khỏe") ||
      messageLower.includes("khám sức khỏe") ||
      titleLower.includes("đợt khám") ||
      messageLower.includes("đợt khám") ||
      titleLower.includes("health examination") ||
      messageLower.includes("health examination")
    ) {
      // Check if this is a health check result notification
      if (
        titleLower.includes("kết quả") ||
        messageLower.includes("kết quả") ||
        titleLower.includes("result") ||
        messageLower.includes("result") ||
        titleLower.includes("kết quả khám") ||
        messageLower.includes("kết quả khám")
      ) {
        return "health-check-result";
      }
      return "health";
    }

    return "general";
  };

  const determinePriority = (notification) => {
    // Determine priority based on notification content
    if (
      notification.title?.includes("từ chối") ||
      notification.title?.includes("thất bại") ||
      notification.title?.includes("rejected") ||
      notification.title?.includes("failed")
    ) {
      return "high";
    } else if (
      notification.title?.includes("duyệt") ||
      notification.title?.includes("cập nhật") ||
      notification.title?.includes("approved") ||
      notification.title?.includes("updated") ||
      notification.title?.includes("scheduled") ||
      notification.title?.includes("completed") ||
      notification.title?.includes("lên lịch") ||
      notification.title?.includes("hoàn thành")
    ) {
      return "medium";
    }
    return "low";
  };

  const determineActionRequired = useCallback((notification) => {
    // Medication-related notifications usually require some action/attention
    // Vaccination notifications with vaccinationFormId also require action
    // Campaign completion requests also require action
    // Status updates do NOT require action (they are informational)
    const type = getNotificationType(notification);
    return (
      notification.medicationRequest ||
      notification.medicationSchedule ||
      notification.vaccinationFormId ||
      notification.healthCheckFormId ||
      type === "completion-request"
    );
  }, []);

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

  // Helper function to check if content is HTML
  const isHtmlContent = useCallback((content) => {
    if (!content) return false;
    return /<[^>]+>/.test(content);
  }, []);

  // Load notifications on component mount
  const loadNotifications = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingRef.current) return;
    
    const token = getToken();
    if (!token) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      const data = await api.getAllNotifications(token);
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Transform backend notification data to frontend format
        const transformedNotifications = data.map((notification) => {
          // Translate notification title if it's in English
          let translatedTitle = notification.title;
          if (translatedTitle === "Campaign Approved") {
            translatedTitle = "Chiến dịch được phê duyệt";
          } else if (translatedTitle === "Campaign Rejected") {
            translatedTitle = "Chiến dịch bị từ chối";
          } else if (translatedTitle === "Campaign Scheduled") {
            translatedTitle = "Chiến dịch đã lên lịch";
          } else if (translatedTitle === "Campaign Completed") {
            translatedTitle = "Chiến dịch hoàn thành";
          } else if (translatedTitle === "Health Check Approved") {
            translatedTitle = "Đợt khám sức khỏe được phê duyệt";
          } else if (translatedTitle === "Health Check Rejected") {
            translatedTitle = "Đợt khám sức khỏe bị từ chối";
          } else if (translatedTitle === "Medication Request Approved") {
            translatedTitle = "Yêu cầu thuốc được phê duyệt";
          } else if (translatedTitle === "Medication Request Rejected") {
            translatedTitle = "Yêu cầu thuốc bị từ chối";
          }

          return {
            id: notification.id,
            type: getNotificationType(notification),
            title: translatedTitle,
            message: notification.message,
            time: formatTimeAgo(notification.createdAt),
            date: notification.createdAt,
            read: notification.read,
            priority: determinePriority(notification),
            actionRequired: determineActionRequired(notification),
            medicationRequest: notification.medicationRequest,
            medicationSchedule: notification.medicationSchedule,
            vaccinationFormId: notification.vaccinationFormId,
            healthCheckFormId: notification.healthCheckFormId,
          };
        });

        setNotifications(transformedNotifications);
      }
      // Transform backend notification data to frontend format
      const transformedNotifications = data.map((notification) => {
        // Debug log to see what we're receiving from backend
        console.log("Raw notification from backend:", notification);
        
        // Translate notification title if it's in English
        let translatedTitle = notification.title;
        if (translatedTitle === "Campaign Approved") {
          translatedTitle = "Chiến dịch được phê duyệt";
        } else if (translatedTitle === "Campaign Rejected") {
          translatedTitle = "Chiến dịch bị từ chối";
        } else if (translatedTitle === "Campaign Scheduled") {
          translatedTitle = "Chiến dịch đã lên lịch";
        } else if (translatedTitle === "Campaign Completed") {
          translatedTitle = "Chiến dịch hoàn thành";
        } else if (translatedTitle === "Health Check Approved") {
          translatedTitle = "Đợt khám sức khỏe được phê duyệt";
        } else if (translatedTitle === "Health Check Rejected") {
          translatedTitle = "Đợt khám sức khỏe bị từ chối";
        } else if (translatedTitle === "Medication Request Approved") {
          translatedTitle = "Yêu cầu thuốc được phê duyệt";
        } else if (translatedTitle === "Medication Request Rejected") {
          translatedTitle = "Yêu cầu thuốc bị từ chối";
        }

        return {
          id: notification.id,
          type: getNotificationType(notification),
          title: translatedTitle,
          message: notification.message,
          time: formatTimeAgo(notification.createdAt),
          date: notification.createdAt,
          read: notification.read,
          priority: determinePriority(notification),
          actionRequired: determineActionRequired(notification),
          medicationRequest: notification.medicationRequest,
          medicationSchedule: notification.medicationSchedule,
          vaccinationFormId: notification.vaccinationFormId,
          healthCheckFormId: notification.healthCheckFormId,
          campaignCompletionRequestId: notification.campaignCompletionRequestId,
        };
      });

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      if (isMounted.current) {
        setError("Không thể tải thông báo. Vui lòng thử lại.");
      }
    } finally {
      isLoadingRef.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [getToken, determineActionRequired, api]);

  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket
      await webSocketService.connect(token);
      // Add message handler for real-time notifications
      webSocketService.addMessageHandler("/queue/notifications", (newNotification) => {
        if (!isMounted.current) return;
        
        // Translate notification title if it's in English
        let translatedTitle = newNotification.title;
        if (translatedTitle === "Campaign Approved") {
          translatedTitle = "Chiến dịch được phê duyệt";
        } else if (translatedTitle === "Campaign Rejected") {
          translatedTitle = "Chiến dịch bị từ chối";
        } else if (translatedTitle === "Campaign Scheduled") {
          translatedTitle = "Chiến dịch đã lên lịch";
        } else if (translatedTitle === "Campaign Completed") {
          translatedTitle = "Chiến dịch hoàn thành";
        } else if (translatedTitle === "Health Check Approved") {
          translatedTitle = "Đợt khám sức khỏe được phê duyệt";
        } else if (translatedTitle === "Health Check Rejected") {
          translatedTitle = "Đợt khám sức khỏe bị từ chối";
        } else if (translatedTitle === "Medication Request Approved") {
          translatedTitle = "Yêu cầu thuốc được phê duyệt";
        } else if (translatedTitle === "Medication Request Rejected") {
          translatedTitle = "Yêu cầu thuốc bị từ chối";
        }

        // Transform the new notification
        const transformedNotification = {
          id: newNotification.id,
          type: getNotificationType(newNotification),
          title: translatedTitle,
          message: newNotification.message,
          time: "Vừa xong",
          date: newNotification.createdAt,
          read: false,
          priority: determinePriority(newNotification),
          actionRequired: determineActionRequired(newNotification),
          medicationRequest: newNotification.medicationRequest,
          medicationSchedule: newNotification.medicationSchedule,
          vaccinationFormId: newNotification.vaccinationFormId,
          healthCheckFormId: newNotification.healthCheckFormId,
          campaignCompletionRequestId:
            newNotification.campaignCompletionRequestId,
        };

        // Add new notification to the beginning of the list
        setNotifications((prev) => [transformedNotification, ...prev]);
      });
    } catch (error) {
      console.error("Error setting up WebSocket connection:", error);
    }
  }, [getToken, determineActionRequired]);

  useEffect(() => {
    // Set isMounted ref to true when component mounts
    isMounted.current = true;
    
    // Load data only once when component mounts
    loadNotifications();
    setupWebSocketConnection();

    return () => {
      // Set isMounted ref to false when component unmounts
      isMounted.current = false;
      
      // Cleanup WebSocket connection when component unmounts
      webSocketService.removeMessageHandler("/queue/notifications");
    };
  }, [loadNotifications, setupWebSocketConnection]);

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
      if (isMounted.current) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  const confirmAction = (notification) => {
    // Debug log to see the notification object structure
    console.log("confirmAction called with notification:", notification);
    console.log("healthCheckFormId:", notification.healthCheckFormId);
    console.log("vaccinationFormId:", notification.vaccinationFormId);
    
    // Handle different types of confirmations based on notification type
    const type = getNotificationType(notification);
    console.log("Notification type determined as:", type);

    if (type === "status-update") {
      // For status updates, just mark as read - no special action needed
    } else if (notification.medicationRequest) {
      // Redirect to medication request details
    } else if (notification.medicationSchedule) {
      // Redirect to medication schedule details
    } else if (notification.vaccinationFormId) {
      // Open vaccination form modal
      setSelectedVaccinationFormId(notification.vaccinationFormId);
      setShowVaccinationModal(true);
    } else if (notification.healthCheckFormId) {
      // Open health check form modal only for parent role
      // Skip opening modal for schoolnurse and manager roles
      if (role !== "schoolnurse" && role !== "manager") {
        console.log("Opening health check form modal for ID:", notification.healthCheckFormId);
        setSelectedHealthCheckFormId(notification.healthCheckFormId);
        setShowHealthCheckModal(true);
      } else {
        console.log("Health check form modal disabled for role:", role);
      }
    } 
    // Note: Removed health check result modal logic - health check results don't have "Xem chi tiết" button

    // Mark as read when action is taken
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleVaccinationFormUpdated = () => {
    // Refresh notifications when vaccination form is updated
    setTimeout(() => {
      loadNotifications();
    }, 500);
  };

  const handleHealthCheckFormUpdated = () => {
    // Refresh notifications when health check form is updated
    setTimeout(() => {
      loadNotifications();
    }, 500);
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
      case "completion-request":
        return "fas fa-check-circle";
      case "status-update":
        return "fas fa-info-circle";
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
          <button
            className={filter === "health" ? "active" : ""}
            onClick={() => setFilter("health")}
          >
            Khám sức khỏe
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
          {filteredNotifications.map((notification, index) => (
            <div
              key={`notification-${notification.id}-${index}`}
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
                {/* Render message content - always check for HTML first */}
                {isHtmlContent(notification.message) ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                    style={notificationContentStyles.content}
                  />
                ) : (
                  // Fallback for plain text messages
                  <div style={notificationContentStyles.content}>
                    {notification.message.split('\n').map((line, i) => (
                      <div key={i} style={notificationContentStyles.textFallback}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}

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
                        {(() => {
                          switch (notification.medicationRequest.status) {
                            case "PENDING":
                              return "Chờ duyệt";
                            case "APPROVED":
                              return "Đã duyệt";
                            case "REJECTED":
                              return "Từ chối";
                            default:
                              return (
                                notification.medicationRequest.status ||
                                "Không xác định"
                              );
                          }
                        })()}
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
                  <span>

                  {(() => {
                  const date = convertLocalDateTimeArray(notification.date);
                  return date ? date.toLocaleDateString("vi-VN") : "N/A";
                })()}

                  </span>
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
                {notification.actionRequired && 
                 role === "parent" && 
                 getNotificationType(notification) !== "health-check-result" && (
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
      {/* Health Check Form Modal */}
      {showHealthCheckModal && (
        <HealthCheckFormModal
          isOpen={showHealthCheckModal}
          healthCheckFormId={selectedHealthCheckFormId}
          onClose={() => setShowHealthCheckModal(false)}
          onFormUpdated={handleHealthCheckFormUpdated}
        />
      )}
    </div>
  );
};

export default Notifications;
