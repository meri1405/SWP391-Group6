import React, { useState, useEffect, useCallback } from "react";
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
  const [showCompletionRequestModal, setShowCompletionRequestModal] =
    useState(false);
  const [selectedCompletionRequest, setSelectedCompletionRequest] =
    useState(null);

  // Function to show beautiful success notification
  const showSuccessNotification = (campaignName) => {
    Modal.success({
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Phê duyệt thành công!
        </div>
      ),
      content: (
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #f6ffed 0%, #f9ffed 100%)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #b7eb8f",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                color: "#262626",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Chiến dịch tiêm chủng đã được hoàn thành!
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#595959",
                lineHeight: "1.6",
              }}
            >
              Chiến dịch <strong>"{campaignName}"</strong> đã được phê duyệt
              hoàn thành thành công.
            </div>
          </div>

          <div
            style={{
              background: "#f0f9ff",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #91d5ff",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#1890ff",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Thông tin chi tiết:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#595959",
                fontSize: "14px",
              }}
            >
              <li>
                Trạng thái chiến dịch đã được cập nhật thành "Đã hoàn thành"
              </li>
              <li>Y tá đã được thông báo về việc phê duyệt</li>
              <li>Dữ liệu chiến dịch đã được lưu trữ vào hệ thống</li>
            </ul>
          </div>
        </div>
      ),
      okText: "Đã hiểu",
      width: 520,
      centered: true,
      okButtonProps: {
        size: "large",
        style: {
          background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
          border: "none",
          borderRadius: "8px",
          height: "40px",
          fontWeight: "600",
          fontSize: "16px",
        },
      },
    });
  };
  const { getToken } = useAuth();
  
  // Styles for health check notifications
  const healthCheckMessageStyles = {
    healthCheckMessage: {
      lineHeight: "1.6",
      whiteSpace: "pre-line",
      fontFamily: "Arial, sans-serif",
    },
    messageHeader: {
      fontWeight: "bold",
      marginBottom: "10px",
    },
    messageBody: {
      margin: "8px 0",
    },
    messageFooter: {
      marginTop: "10px",
      fontStyle: "italic",
    },
    messageSection: {
      marginTop: "15px",
      marginBottom: "5px",
      fontWeight: "bold",
      borderTop: "1px solid #eee",
      paddingTop: "10px",
    },
    messageSpacer: {
      height: "10px",
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

  const determineActionRequired = (notification) => {
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
      .replace(/Campaign Approved/gi, "Chiến dịch được phê duyệt")
      .replace(/Your health check campaign/gi, "Đợt khám sức khỏe của bạn")
      .replace(/health check campaign/gi, "đợt khám sức khỏe")
      .replace(/Health Check Campaign/gi, "Đợt khám sức khỏe")
      .replace(/has been rejected/gi, "đã bị từ chối")
      .replace(/has been approved/gi, "đã được phê duyệt")
      .replace(/has been scheduled/gi, "đã được lên lịch")
      .replace(/has been completed/gi, "đã hoàn thành")
      .replace(/has been cancelled/gi, "đã bị hủy")
      .replace(/Your medication request/gi, "Yêu cầu thuốc của bạn")
      .replace(/medication request/gi, "yêu cầu thuốc")
      .replace(/Medication Request/gi, "Yêu cầu thuốc")
      .replace(/has been processed/gi, "đã được xử lý")
      .replace(/needs attention/gi, "cần được chú ý")
      .replace(/requires review/gi, "cần được xem xét");
    
    // Format the message with proper line breaks for health check notifications
    if (translatedMessage.includes("đợt khám sức khỏe") || 
        translatedMessage.includes("Đợt khám sức khỏe") ||
        translatedMessage.includes("Thân gửi Quý phụ huynh")) {
      
      // Format health check notifications with proper paragraph breaks
      translatedMessage = translatedMessage
        // First, normalize line breaks (remove duplicates, etc)
        .replace(/\n\s*\n/g, '\n')
        // Add proper spacing around key phrases
        .replace(/Thân gửi Quý phụ huynh,/g, 'Thân gửi Quý phụ huynh, ')
        .replace(/Nhà trường thông báo/g, 'Nhà trường thông báo')
        .replace(/Kính đề nghị/g, 'Kính đề nghị')
        .replace(/Vui lòng phản hồi/g, 'Vui lòng phản hồi')
        .replace(/Trân trọng,/g, 'Trân trọng,')
        .replace(/Ban Giám hiệu/g, 'Ban Giám hiệu')
        .replace(/--- Thông tin học sinh ---/g, '--- Thông tin học sinh ---')
        .replace(/Tên:/g, 'Tên:')
        .replace(/Lớp:/g, 'Lớp:');
    }

    // Replace ISO dates with Vietnamese format
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
            message: formatNotificationMessage(notification.message),
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
          message: formatNotificationMessage(notification.message),
          time: formatTimeAgo(notification.createdAt),
          date: notification.createdAt,
          read: notification.read,
          priority: determinePriority(notification),
          actionRequired: determineActionRequired(notification),
          medicationRequest: notification.medicationRequest,
          medicationSchedule: notification.medicationSchedule,
          vaccinationFormId: notification.vaccinationFormId,
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
  }, [getToken, formatNotificationMessage, api]);

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
          message: formatNotificationMessage(newNotification.message),
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
  }, [getToken, formatNotificationMessage]);

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
    // Handle different types of confirmations based on notification type
    const type = getNotificationType(notification);

    if (type === "completion-request") {
      // Open completion request modal
      setSelectedCompletionRequest(notification);
      setShowCompletionRequestModal(true);
    } else if (type === "status-update") {
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
                {notification.type === "health" ? (
                  <div style={healthCheckMessageStyles.healthCheckMessage}>
                    {notification.message.split('\n').map((line, i) => {
                      if (!line.trim()) {
                        return <div key={i} style={healthCheckMessageStyles.messageSpacer}></div>;
                      } else if (line.includes("Thân gửi")) {
                        return <div key={i} style={healthCheckMessageStyles.messageHeader}>{line}</div>;
                      } else if (line.includes("Trân trọng") || line.includes("Ban Giám hiệu")) {
                        return <div key={i} style={healthCheckMessageStyles.messageFooter}>{line}</div>;
                      } else if (line.includes("--- Thông tin học sinh ---")) {
                        return <div key={i} style={healthCheckMessageStyles.messageSection}>{line}</div>;
                      } else {
                        return <div key={i} style={healthCheckMessageStyles.messageBody}>{line}</div>;
                      }
                    })}
                  </div>
                ) : (
                  <p>{notification.message}</p>
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
                {notification.actionRequired && 
                  // Hide "Xem chi tiết" button for health check notifications when user is schoolnurse
                  !(notification.healthCheckFormId && (role === "schoolnurse")) && (
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
      {/* Campaign Completion Request Modal */}
      {showCompletionRequestModal && (
        <CampaignCompletionRequestModal
          isOpen={showCompletionRequestModal}
          completionRequest={selectedCompletionRequest}
          onClose={() => {
            setShowCompletionRequestModal(false);
            setSelectedCompletionRequest(null);
          }}
          onRequestProcessed={() => {
            loadNotifications();
            setShowCompletionRequestModal(false);
            setSelectedCompletionRequest(null);
          }}
          api={api}
          showSuccessNotification={showSuccessNotification}
        />
      )}
    </div>
  );
};

// Campaign Completion Request Modal Component
const CampaignCompletionRequestModal = ({
  isOpen,
  completionRequest,
  onClose,
  onRequestProcessed,
  api,
  showSuccessNotification,
}) => {
  const [loading, setLoading] = useState(false);

  // Check if the completion request has already been processed
  const isRequestProcessed =
    completionRequest?.status === "APPROVED" ||
    completionRequest?.status === "REJECTED";
  const statusMessage =
    completionRequest?.status === "APPROVED"
      ? "Yêu cầu đã được phê duyệt"
      : completionRequest?.status === "REJECTED"
      ? "Yêu cầu đã bị từ chối"
      : null;

  // Helper function to extract statistics from completion request message
  const extractStatFromMessage = (message, type) => {
    if (!message) return "0";

    // console.log("Parsing message:", message);
    // console.log("Looking for type:", type);

    try {
      // More flexible patterns to match different message formats
      switch (type) {
        case "total":
          // Try different patterns for total
          let totalMatch = message.match(
            /(?:Tổng số.*?học sinh.*?:?\s*)(\d+)/i
          );
          if (!totalMatch) totalMatch = message.match(/(?:tổng.*?:?\s*)(\d+)/i);
          if (totalMatch) {
            // console.log("Found total:", totalMatch[1]);
            return totalMatch[1];
          }

          // If no explicit total, calculate from sum of all statuses
          const vaccinatedMatch = message.match(/(?:đã tiêm.*?:?\s*)(\d+)/i);
          const postponedMatch = message.match(/(?:hoãn.*?:?\s*)(\d+)/i);
          const pendingMatch = message.match(
            /(?:chưa.*?xác nhận.*?:?\s*)(\d+)/i
          );

          const vaccinated = vaccinatedMatch ? parseInt(vaccinatedMatch[1]) : 0;
          const postponed = postponedMatch ? parseInt(postponedMatch[1]) : 0;
          const pending = pendingMatch ? parseInt(pendingMatch[1]) : 0;

          const total = vaccinated + postponed + pending;
          // console.log("Calculated total:", total, "from:", {
          //   vaccinated,
          //   postponed,
          //   pending,
          // });
          return total.toString();

        case "vaccinated":
          const vacMatch = message.match(/(?:đã tiêm.*?:?\s*)(\d+)/i);
          const result = vacMatch ? vacMatch[1] : "0";
          // console.log("Found vaccinated:", result);
          return result;

        case "postponed":
          const postMatch = message.match(/(?:hoãn.*?:?\s*)(\d+)/i);
          const postponedResult = postMatch ? postMatch[1] : "0";
          // console.log("Found postponed:", postponedResult);
          return postponedResult;

        case "pending":
          const pendMatch = message.match(/(?:chưa.*?xác nhận.*?:?\s*)(\d+)/i);
          const pendingResult = pendMatch ? pendMatch[1] : "0";
          // console.log("Found pending:", pendingResult);
          return pendingResult;

        default:
          return "0";
      }
    } catch (error) {
      console.error("Error parsing completion request message:", error);
      return "0";
    }
  };

  // Helper functions to extract information from completion request
  const extractCampaignName = (completionRequest) => {
    if (!completionRequest) return "N/A";

    // Extract campaign name from title - remove prefix
    if (completionRequest.title?.includes("YÊU CẦU HOÀN THÀNH CHIẾN DỊCH:")) {
      const result = completionRequest.title
        .replace("YÊU CẦU HOÀN THÀNH CHIẾN DỊCH: ", "")
        .trim();
      return result;
    }

    // Try to extract from message
    const message = completionRequest.message || "";
    const campaignMatch = message.match(/chiến dịch '([^']+)'/i);
    if (campaignMatch) {
      return campaignMatch[1];
    }

    return "N/A";
  };

  const extractRequesterName = (completionRequest) => {
    if (!completionRequest) return "N/A";

    const message = completionRequest.message || "";

    // Try different patterns to extract nurse name
    // Pattern 1: "được tạo bởi Y tá [Full Name] yêu cầu" (handle multiple spaces)
    let nameMatch = message.match(
      /được tạo bởi\s+Y tá\s+([^yêu]+?)\s+yêu cầu/i
    );
    if (nameMatch) {
      return nameMatch[1].trim();
    }

    // Pattern 2: "Y tá [Full Name] yêu cầu" (handle multiple spaces)
    nameMatch = message.match(/Y tá\s+([^yêu]+?)\s+yêu cầu/i);
    if (nameMatch) {
      return nameMatch[1].trim();
    }

    // Pattern 3: "được tạo bởi [Full Name] yêu cầu" (without Y tá prefix)
    nameMatch = message.match(/được tạo bởi\s+([^yêu]+?)\s+yêu cầu/i);
    if (nameMatch && !nameMatch[1].includes("Y tá")) {
      return nameMatch[1].trim();
    }

    // Pattern 4: "tạo bởi Y tá [Name]"
    nameMatch = message.match(/tạo bởi\s+Y tá\s+([^yêu]+)/i);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    return "Y tá Trường học";
  };

  const formatFullDateTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString(); // No padding for hours
      const minutes = date.getMinutes().toString().padStart(2, "0");

      // Format as "YYYY MM DD H:MM" (ví dụ: "2025 07 02 1:18")
      const result = `${year} ${month} ${day} ${hours}:${minutes}`;
      return result;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (!isOpen || !completionRequest) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Test manager authentication with server
      try {
        const authResult = await managerApi.testManagerAuth();
      } catch (authError) {
        alert(
          "Bạn không có quyền truy cập chức năng này. Vui lòng đăng nhập lại với tài khoản Manager."
        );
        return;
      }

      // Check if we have a valid campaignCompletionRequestId from the notification
      if (
        completionRequest.campaignCompletionRequestId &&
        completionRequest.campaignCompletionRequestId !== null
      ) {
        await managerApi.approveCompletionRequest(
          completionRequest.campaignCompletionRequestId,
          "Đã phê duyệt yêu cầu hoàn thành chiến dịch"
        );
        showSuccessNotification(extractCampaignName(completionRequest));
        onRequestProcessed();
        return;
      }

      // Try different possible ID fields - prioritize campaignCompletionRequestId first
      const possibleRequestId =
        completionRequest.campaignCompletionRequestId ||
        completionRequest.completionRequestId ||
        completionRequest.requestId ||
        completionRequest.vaccinationCampaignId ||
        completionRequest.campaignId ||
        completionRequest.id;

      const requestId = possibleRequestId;

      // Additional safety check
      if (!requestId) {
        alert(
          "Không thể xác định ID của yêu cầu hoàn thành chiến dịch. Vui lòng thử lại."
        );
        return;
      }

      // If we're still using notification ID (which means this is an old notification without campaignCompletionRequestId),
      // try to find the actual completion request
      if (
        requestId === completionRequest.id &&
        !completionRequest.campaignCompletionRequestId
      ) {
        console.warn(
          "Warning: Using notification ID as completion request ID. This might be an old notification."
        );
        console.warn("Attempting to find actual completion request...");

        try {
          // Extract campaign name from notification message
          const campaignName = extractCampaignName(completionRequest);

          if (campaignName && campaignName !== "N/A") {
            // Try to find completion request by campaign name
            const actualRequest =
              await managerApi.findOrCreateCompletionRequest(campaignName);
            if (actualRequest && actualRequest.id) {
              const actualRequestId = actualRequest.id;

              // Use the actual completion request ID
              await managerApi.approveCompletionRequest(
                actualRequestId,
                "Đã phê duyệt yêu cầu hoàn thành chiến dịch"
              );
              showSuccessNotification(campaignName);
              onRequestProcessed();
              return;
            }
          }
        } catch (error) {
          // Show user-friendly error message for this specific case
          alert(
            "Không thể tìm thấy yêu cầu hoàn thành chiến dịch. Có thể yêu cầu này đã được xử lý hoặc bị xóa. Vui lòng làm mới trang và thử lại."
          );
          return;
        }
      }

      // Use managerApi directly for completion request operations
      await managerApi.approveCompletionRequest(
        requestId,
        "Đã phê duyệt yêu cầu hoàn thành chiến dịch"
      );
      showSuccessNotification(extractCampaignName(completionRequest));
      onRequestProcessed();
    } catch (error) {
      console.error("Error approving completion request:", error);

      // Enhanced error logging
      if (error.response) {
        console.log("Error status:", error.response.status);
        console.log("Error data:", error.response.data);
        console.log("Error headers:", error.response.headers);
      }

      alert("Không thể xác nhận yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setLoading(true);
    try {
      // Extract completion request ID from notification or use default
      console.log(
        "Full completion request object:",
        JSON.stringify(completionRequest, null, 2)
      );
      console.log("Completion request keys:", Object.keys(completionRequest));

      // Try different possible ID fields - prioritize campaignCompletionRequestId first
      const possibleRequestId =
        completionRequest.campaignCompletionRequestId ||
        completionRequest.completionRequestId ||
        completionRequest.requestId ||
        completionRequest.vaccinationCampaignId ||
        completionRequest.campaignId ||
        completionRequest.id;

      console.log("Possible completion request IDs:", {
        campaignCompletionRequestId:
          completionRequest.campaignCompletionRequestId,
        completionRequestId: completionRequest.completionRequestId,
        requestId: completionRequest.requestId,
        vaccinationCampaignId: completionRequest.vaccinationCampaignId,
        campaignId: completionRequest.campaignId,
        id: completionRequest.id,
        selected: possibleRequestId,
      });

      const requestId = possibleRequestId;

      // Additional safety check
      if (!requestId) {
        alert(
          "Không thể xác định ID của yêu cầu hoàn thành chiến dịch. Vui lòng thử lại."
        );
        return;
      }

      // If we're still using notification ID (which means this is an old notification without campaignCompletionRequestId),
      // try to find the actual completion request
      if (
        requestId === completionRequest.id &&
        !completionRequest.campaignCompletionRequestId
      ) {
        console.log(
          "Warning: Using notification ID as completion request ID. This might be an old notification."
        );
        console.log("Attempting to find actual completion request...");

        try {
          // Extract campaign name from notification message
          const campaignName = extractCampaignName(completionRequest);
          console.log("Extracted campaign name:", campaignName);

          if (campaignName && campaignName !== "N/A") {
            // Try to find completion request by campaign name
            const actualRequest =
              await managerApi.findOrCreateCompletionRequest(campaignName);
            if (actualRequest && actualRequest.id) {
              console.log("Found actual completion request:", actualRequest);
              const actualRequestId = actualRequest.id;
              console.log(
                "Using actual completion request ID:",
                actualRequestId
              );

              // Use the actual completion request ID
              await managerApi.rejectCompletionRequest(
                actualRequestId,
                rejectReason
              );
              alert("Đã từ chối yêu cầu hoàn thành chiến dịch");
              onRequestProcessed();
              return;
            }
          }
        } catch (error) {
          console.error("Error finding actual completion request:", error);
          // Continue with original logic as fallback
        }
      }

      // Use managerApi directly for completion request operations
      await managerApi.rejectCompletionRequest(requestId, rejectReason);
      alert("Đã từ chối yêu cầu hoàn thành chiến dịch");
      onRequestProcessed();
    } catch (error) {
      console.error("Error rejecting completion request:", error);
      alert("Không thể từ chối yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết yêu cầu hoàn thành chiến dịch</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="completion-request-details">
            <div className="campaign-info">
              <h3>Thông tin chiến dịch</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Tiêu đề:</strong>
                  <span>{completionRequest.title}</span>
                </div>
                <div className="info-item">
                  <strong>Thông báo:</strong>
                  <span>{completionRequest.message}</span>
                </div>
                <div className="info-item">
                  <strong>Thời gian yêu cầu:</strong>
                  <span>{completionRequest.time}</span>
                </div>
              </div>
            </div>

            {/* Only show statistics if message contains actual statistics */}
            {completionRequest.message.includes("đã tiêm") ||
            completionRequest.message.includes("hoãn tiêm") ||
            completionRequest.message.includes("chưa xác nhận") ? (
              <div className="campaign-statistics">
                <h3>Thống kê chiến dịch</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "total"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Tổng số học sinh</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "vaccinated"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Đã tiêm thành công</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "postponed"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Hoãn tiêm</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "pending"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Chưa xác nhận</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="campaign-statistics">
                <h3>Thông tin yêu cầu hoàn thành</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Chiến dịch:</strong>
                    <span>{extractCampaignName(completionRequest)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Người yêu cầu:</strong>
                    <span>{extractRequesterName(completionRequest)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Thời gian yêu cầu:</strong>
                    <span>{formatFullDateTime(completionRequest.date)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Trạng thái hiện tại:</strong>
                    <span>Đang chờ phê duyệt</span>
                  </div>
                </div>

                <div
                  className="completion-note"
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ color: "#389e0d", fontWeight: "500" }}>
                    <i
                      className="fas fa-info-circle"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Lưu ý quan trọng
                  </div>
                  <div style={{ marginTop: "8px", color: "#595959" }}>
                    Vui lòng kiểm tra kỹ thông tin chiến dịch, tình hình tiêm
                    chủng và các báo cáo liên quan trước khi phê duyệt yêu cầu
                    hoàn thành chiến dịch này.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {/* Show status message if request has been processed */}
          {isRequestProcessed && (
            <div
              style={{
                width: "100%",
                padding: "12px 20px",
                margin: "10px 0",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor:
                  completionRequest?.status === "APPROVED"
                    ? "#f6ffed"
                    : "#fff2f0",
                border:
                  completionRequest?.status === "APPROVED"
                    ? "1px solid #b7eb8f"
                    : "1px solid #ffccc7",
                color:
                  completionRequest?.status === "APPROVED"
                    ? "#52c41a"
                    : "#f5222d",
              }}
            >
              {statusMessage}
              {completionRequest?.reviewNotes && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    fontWeight: "normal",
                    color: "#666",
                  }}
                >
                  <strong>Ghi chú:</strong> {completionRequest.reviewNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
