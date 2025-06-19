import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { parentApi } from "../../api/parentApi";
import webSocketService from "../../services/webSocketService";
import "../../styles/Notifications.css";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();
  // Load notifications on component mount
  const loadNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await parentApi.getAllNotifications(token);

      // Transform backend notification data to frontend format
      const transformedNotifications = data.map((notification) => ({
        id: notification.id,
        type: getNotificationType(notification),
        title: formatNotificationTitle(notification),
        message: formatNotificationMessage(notification),
        time: formatTimeAgo(notification.createdAt),
        date: notification.createdAt,
        read: notification.read,
        priority: determinePriority(notification),
        actionRequired: determineActionRequired(notification),
        medicationRequest: notification.medicationRequest,
        medicationSchedule: notification.medicationSchedule,
        originalNotification: notification, // Keep original for reference
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket
      await webSocketService.connect(token);

      // Add message handler for real-time notifications
      webSocketService.addMessageHandler("notifications", (newNotification) => {
        console.log("Received real-time notification:", newNotification);

        // Transform the new notification
        const transformedNotification = {
          id: newNotification.id,
          type: getNotificationType(newNotification),
          title: formatNotificationTitle(newNotification),
          message: formatNotificationMessage(newNotification),
          time: "Vừa xong",
          date: newNotification.createdAt,
          read: false,
          priority: determinePriority(newNotification),
          actionRequired: determineActionRequired(newNotification),
          medicationRequest: newNotification.medicationRequest,
          medicationSchedule: newNotification.medicationSchedule,
          originalNotification: newNotification,
        };

        // Add new notification to the beginning of the list
        setNotifications((prev) => [transformedNotification, ...prev]);
      });
    } catch (error) {
      console.error("Error setting up WebSocket connection:", error);
    }
  }, [getToken]);

  useEffect(() => {
    loadNotifications();
    setupWebSocketConnection();

    return () => {
      // Cleanup WebSocket connection when component unmounts
      webSocketService.removeMessageHandler("notifications");
    };
  }, [loadNotifications, setupWebSocketConnection]);

  const getNotificationType = (notification) => {
    // Enhanced type detection based on notification content
    const title = (notification.title || "").toLowerCase();
    const message = (notification.message || "").toLowerCase();

    if (
      notification.medicationRequest ||
      title.includes("thuốc") ||
      message.includes("thuốc")
    ) {
      return "medication";
    } else if (
      notification.medicationSchedule ||
      title.includes("lịch uống") ||
      message.includes("lịch uống")
    ) {
      return "medication";
    } else if (
      title.includes("tiêm chủng") ||
      message.includes("vaccine") ||
      message.includes("tiêm")
    ) {
      return "vaccination";
    } else if (
      title.includes("sức khỏe") ||
      title.includes("khám") ||
      message.includes("sức khỏe")
    ) {
      return "health";
    } else if (
      title.includes("sự kiện y tế") ||
      message.includes("medical event") ||
      message.includes("accident")
    ) {
      return "medical-event";
    } else if (title.includes("cảnh báo") || title.includes("khẩn cấp")) {
      return "alert";
    }
    return "general";
  };

  // Enhanced Vietnamese message formatting
  const formatNotificationMessage = (notification) => {
    const originalMessage = notification.message || "";

    // If message is already in Vietnamese but contains medical event info, still process it
    const isVietnameseMessage =
      originalMessage.includes("đã được") ||
      originalMessage.includes("vui lòng") ||
      originalMessage.includes("của bạn");

    const hasMedicalEventEnums =
      originalMessage.includes("Loại:") ||
      originalMessage.includes("Mức độ nghiêm trọng:") ||
      originalMessage.includes("EPIDEMIC") ||
      originalMessage.includes("FEVER") ||
      originalMessage.includes("MODERATE") ||
      originalMessage.includes("MILD") ||
      originalMessage.includes("SEVERE");

    if (isVietnameseMessage && !hasMedicalEventEnums) {
      return originalMessage;
    }

    // Enhanced message formatting for common notification types
    if (notification.medicationRequest) {
      const request = notification.medicationRequest;
      return `Yêu cầu cấp thuốc cho con bạn đã ${getStatusInVietnamese(
        request.status
      )}. ${getAdditionalInfo(notification)}`;
    }

    if (notification.medicationSchedule) {
      const schedule = notification.medicationSchedule;
      return `Lịch uống thuốc của con bạn đã được ${getScheduleStatusInVietnamese(
        schedule.status
      )}. ${getAdditionalInfo(notification)}`;
    }

    // Format medical event notifications
    if (
      originalMessage.includes("medical event") ||
      originalMessage.includes("Medical Event") ||
      originalMessage.includes("sự kiện y tế") ||
      originalMessage.includes("Loại:") ||
      originalMessage.includes("Mức độ nghiêm trọng:") ||
      originalMessage.includes("EPIDEMIC") ||
      originalMessage.includes("FEVER") ||
      originalMessage.includes("MODERATE") ||
      originalMessage.includes("MILD") ||
      originalMessage.includes("SEVERE")
    ) {
      return formatMedicalEventMessage(originalMessage);
    }

    // Format vaccination notifications
    if (
      originalMessage.includes("vaccination") ||
      originalMessage.includes("vaccine")
    ) {
      return formatVaccinationMessage(originalMessage);
    }

    // Default: try to translate common English phrases
    return translateCommonPhrases(originalMessage);
  };

  const getStatusInVietnamese = (status) => {
    const statusMap = {
      PENDING: "đang chờ xử lý",
      APPROVED: "được chấp thuận",
      REJECTED: "bị từ chối",
      PROCESSING: "đang được xử lý",
      COMPLETED: "hoàn thành",
      CANCELLED: "bị hủy",
    };
    return statusMap[status] || status.toLowerCase();
  };

  const getScheduleStatusInVietnamese = (status) => {
    const statusMap = {
      ACTIVE: "kích hoạt",
      COMPLETED: "hoàn thành",
      PAUSED: "tạm dừng",
      CANCELLED: "hủy bỏ",
    };
    return statusMap[status] || status.toLowerCase();
  };

  const formatMedicalEventMessage = (message) => {
    // Translate medical event types
    const translateEventType = (type) => {
      const eventTypes = {
        FEVER: "Sốt",
        ACCIDENT: "Tai nạn",
        INJURY: "Chấn thương",
        ALLERGY: "Dị ứng",
        EMERGENCY: "Cấp cứu",
        ILLNESS: "Bệnh tật",
        CONSULTATION: "Tư vấn y tế",
        EPIDEMIC: "Dịch bệnh",
        FALL: "Té ngã",
        OTHER_EMERGENCY: "Cấp cứu khác",
      };
      return eventTypes[type] || type;
    };

    // Translate severity levels
    const translateSeverity = (severity) => {
      const severityLevels = {
        MILD: "Nhẹ",
        MODERATE: "Trung bình",
        SEVERE: "Nặng",
        CRITICAL: "Nguy kịch",
      };
      return severityLevels[severity] || severity;
    };

    // Format datetime to Vietnamese
    const formatDateTime = (dateTimeStr) => {
      try {
        const date = new Date(dateTimeStr);
        return date.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch (error) {
        return dateTimeStr;
      }
    };

    // Enhanced medical event message formatting
    let formattedMessage = message;

    // Replace main message (both Vietnamese and English)
    formattedMessage = formattedMessage.replace(
      /Con của bạn đã gặp phải một sự kiện y tế/g,
      "Con bạn đã gặp sự kiện y tế"
    );

    // Also handle the case without "phải"
    formattedMessage = formattedMessage.replace(
      /Con của bạn đã gặp một sự kiện y tế/g,
      "Con bạn đã gặp sự kiện y tế"
    );

    // Replace English main message
    formattedMessage = formattedMessage.replace(
      /Your child has experienced a medical event\./g,
      "Con bạn đã gặp sự kiện y tế."
    );

    // Replace ending message
    formattedMessage = formattedMessage.replace(
      /Please respond or contact the school nurse for more information\./g,
      "Vui lòng phản hồi hoặc liên hệ với y tá trường để biết thêm thông tin."
    );

    // Replace and translate event types (handle both Vietnamese "Loại:" and English "Type:")
    formattedMessage = formattedMessage.replace(
      /Loại:\s*([A-Z_]+)/gm,
      (match, type) => {
        return `Loại sự kiện: ${translateEventType(type.trim())}`;
      }
    );

    formattedMessage = formattedMessage.replace(
      /Type:\s*([A-Z_]+)/g,
      (match, type) => {
        return `Loại sự kiện: ${translateEventType(type.trim())}`;
      }
    );

    // Replace and translate severity (handle both Vietnamese and English formats)
    formattedMessage = formattedMessage.replace(
      /Mức độ nghiêm trọng:\s*([A-Z_]+)/gm,
      (match, severity) => {
        return `Mức độ: ${translateSeverity(severity.trim())}`;
      }
    );

    formattedMessage = formattedMessage.replace(
      /Severity:\s*([A-Z_]+)/g,
      (match, severity) => {
        return `Mức độ: ${translateSeverity(severity.trim())}`;
      }
    );

    // Additional translation for standalone enum values
    // Replace standalone event types that appear without "Loại:"
    const eventTypePattern =
      /\b(FEVER|ACCIDENT|INJURY|ALLERGY|EMERGENCY|ILLNESS|CONSULTATION|EPIDEMIC|FALL|OTHER_EMERGENCY)\b/g;
    formattedMessage = formattedMessage.replace(eventTypePattern, (match) => {
      return translateEventType(match);
    });

    // Replace standalone severity levels that appear without "Mức độ nghiêm trọng:"
    const severityPattern = /\b(MILD|MODERATE|SEVERE|CRITICAL)\b/g;
    formattedMessage = formattedMessage.replace(severityPattern, (match) => {
      return translateSeverity(match);
    });

    // Replace and format datetime (handle both Vietnamese and English formats)
    formattedMessage = formattedMessage.replace(
      /Thời gian:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})/g,
      (match, datetime) => {
        return `Thời gian: ${formatDateTime(datetime)}`;
      }
    );

    formattedMessage = formattedMessage.replace(
      /Time:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})/g,
      (match, datetime) => {
        return `Thời gian: ${formatDateTime(datetime)}`;
      }
    );

    // Handle shorter time format without milliseconds
    formattedMessage = formattedMessage.replace(
      /Time:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/g,
      (match, datetime) => {
        return `Thời gian: ${formatDateTime(datetime)}`;
      }
    );

    // Replace location (handle both Vietnamese and English formats)
    formattedMessage = formattedMessage.replace(
      /Địa điểm:\s*([^\n]+?)(?=\s*Vui lòng)/g,
      (match, location) => {
        return `Địa điểm: ${location.trim()}`;
      }
    );

    formattedMessage = formattedMessage.replace(
      /Location:\s*([^\n]+?)(?=\s*First Aid Provided|Please respond)/g,
      (match, location) => {
        return `Địa điểm: ${location.trim()}`;
      }
    );

    // Replace First Aid Provided
    formattedMessage = formattedMessage.replace(
      /First Aid Provided:\s*([^\n]+?)(?=\s*Please respond)/g,
      (match, firstAid) => {
        return `Sơ cứu đã thực hiện: ${firstAid.trim()}`;
      }
    );

    // Remove duplicate messages (if message appears twice)
    const messageParts = formattedMessage.split(
      /(?=Con của bạn đã gặp|Con bạn đã gặp)/
    );
    if (messageParts.length > 1) {
      // Take only the first occurrence
      formattedMessage = messageParts[1] || messageParts[0];
    }

    // Clean up extra dots and spaces
    formattedMessage = formattedMessage.replace(/\s+/g, " ");
    formattedMessage = formattedMessage.trim();

    // Format the message into clean lines
    if (
      formattedMessage.includes("Loại sự kiện:") ||
      formattedMessage.includes("Loại:") ||
      formattedMessage.includes("Mức độ:")
    ) {
      // Split by line breaks or key phrases
      const parts = formattedMessage.split(
        /\n|(?=Loại sự kiện:|Loại:|Mức độ nghiêm trọng:|Mức độ:|Thời gian:|Địa điểm:|Vui lòng)/
      );
      formattedMessage = parts
        .filter((part) => part.trim())
        .map((part) => part.trim())
        .join("\n");
    }

    // Handle processed messages
    if (message.includes("processed")) {
      formattedMessage = formattedMessage
        .replace(
          /The medical event for your child has been processed by our medical staff/,
          "Sự kiện y tế của con bạn đã được xử lý bởi đội ngũ y tế"
        )
        .replace(/Type:/g, "Loại:")
        .replace(/Processed at:/g, "Xử lý lúc:")
        .replace(/Processed by:/g, "Xử lý bởi:");
    }

    return formattedMessage;
  };

  const formatVaccinationMessage = (message) => {
    return message
      .replace(/vaccination/gi, "tiêm chủng")
      .replace(/vaccine/gi, "vắc xin")
      .replace(/appointment/gi, "lịch hẹn")
      .replace(/scheduled/gi, "đã lên lịch");
  };

  const translateCommonPhrases = (message) => {
    let translatedMessage = message
      .replace(/has been approved/gi, "đã được phê duyệt")
      .replace(/has been rejected/gi, "đã bị từ chối")
      .replace(/has been updated/gi, "đã được cập nhật")
      .replace(/please/gi, "vui lòng")
      .replace(/your child/gi, "con bạn")
      .replace(/contact/gi, "liên hệ");

    // Additional fallback for Vietnamese format medical events that weren't caught
    if (message.includes("Loại:") && message.includes("Mức độ nghiêm trọng:")) {
      // Translate event types
      translatedMessage = translatedMessage
        .replace(/Loại:\s*FEVER/g, "Loại: Sốt")
        .replace(/Loại:\s*EPIDEMIC/g, "Loại: Dịch bệnh")
        .replace(/Loại:\s*ACCIDENT/g, "Loại: Tai nạn")
        .replace(/Loại:\s*FALL/g, "Loại: Té ngã")
        .replace(/Loại:\s*OTHER_EMERGENCY/g, "Loại: Cấp cứu khác");

      // Translate severity levels
      translatedMessage = translatedMessage
        .replace(/Mức độ nghiêm trọng:\s*MILD/g, "Mức độ nghiêm trọng: Nhẹ")
        .replace(
          /Mức độ nghiêm trọng:\s*MODERATE/g,
          "Mức độ nghiêm trọng: Trung bình"
        )
        .replace(/Mức độ nghiêm trọng:\s*SEVERE/g, "Mức độ nghiêm trọng: Nặng");
    }

    return translatedMessage;
  };

  const getAdditionalInfo = (notification) => {
    if (notification.medicationRequest?.rejectionReason) {
      return `Lý do: ${notification.medicationRequest.rejectionReason}`;
    }
    if (notification.medicationRequest?.note) {
      return `Ghi chú: ${notification.medicationRequest.note}`;
    }
    return "";
  };

  // Enhanced Vietnamese title formatting
  const formatNotificationTitle = (notification) => {
    const originalTitle = notification.title || "";

    // If title is already in Vietnamese, return as is
    if (
      originalTitle.includes("Cảnh Báo") ||
      originalTitle.includes("Thông Báo") ||
      originalTitle.includes("Yêu Cầu")
    ) {
      return originalTitle;
    }

    // Enhanced title formatting based on notification type
    const type = getNotificationType(notification);

    switch (type) {
      case "medication":
        if (notification.medicationRequest) {
          return `Yêu Cầu Cấp Thuốc - ${getStatusInVietnamese(
            notification.medicationRequest.status
          )}`;
        }
        if (notification.medicationSchedule) {
          return `Lịch Uống Thuốc - Cập Nhật`;
        }
        return "Thông Báo Thuốc";

      case "vaccination":
        return "Thông Báo Tiêm Chủng";

      case "health":
        return "Thông Báo Sức Khỏe";

      case "medical-event":
        return "Sự Kiện Y Tế";

      case "alert":
        return "Cảnh Báo Quan Trọng";

      default:
        return originalTitle || "Thông Báo Chung";
    }
  };

  const determinePriority = (notification) => {
    const title = (notification.title || "").toLowerCase();
    const message = (notification.message || "").toLowerCase();

    // High priority conditions
    if (
      title.includes("khẩn cấp") ||
      title.includes("cảnh báo") ||
      message.includes("khẩn cấp") ||
      message.includes("emergency") ||
      title.includes("từ chối") ||
      message.includes("rejected")
    ) {
      return "high";
    }

    // Medium priority conditions
    if (
      title.includes("duyệt") ||
      title.includes("approved") ||
      title.includes("cập nhật") ||
      message.includes("updated") ||
      notification.medicationRequest ||
      notification.medicationSchedule
    ) {
      return "medium";
    }

    return "low";
  };

  const determineActionRequired = (notification) => {
    // Medication-related notifications usually require some action/attention
    return notification.medicationRequest || notification.medicationSchedule;
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
      await parentApi.markNotificationAsRead(id, token);
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
    }

    // Mark as read when action is taken
    if (!notification.read) {
      markAsRead(notification.id);
    }
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
          </button>
          <button
            className={filter === "medication" ? "active" : ""}
            onClick={() => setFilter("medication")}
          >
            Thuốc
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
                <p className="notification-message">{notification.message}</p>

                {/* Additional details based on notification type */}
                {notification.medicationRequest && (
                  <div className="notification-details">
                    <div className="detail-item">
                      <strong>Học sinh:</strong>{" "}
                      {notification.medicationRequest.studentName ||
                        "Không xác định"}
                    </div>
                    {notification.medicationRequest.status && (
                      <div className="detail-item">
                        <strong>Trạng thái:</strong>
                        <span
                          className={`status-badge ${notification.medicationRequest.status.toLowerCase()}`}
                        >
                          {getStatusInVietnamese(
                            notification.medicationRequest.status
                          )}
                        </span>
                      </div>
                    )}
                    {notification.medicationRequest.requestDate && (
                      <div className="detail-item">
                        <strong>Ngày yêu cầu:</strong>{" "}
                        {new Date(
                          notification.medicationRequest.requestDate
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </div>
                )}

                {notification.medicationSchedule && (
                  <div className="notification-details">
                    <div className="detail-item">
                      <strong>Lịch uống thuốc:</strong>{" "}
                      {notification.medicationSchedule.medicationName ||
                        "Không xác định"}
                    </div>
                    {notification.medicationSchedule.scheduleTime && (
                      <div className="detail-item">
                        <strong>Thời gian:</strong>{" "}
                        {notification.medicationSchedule.scheduleTime}
                      </div>
                    )}
                  </div>
                )}

                {/* Show formatted date */}
                <div className="notification-timestamp">
                  <i className="fas fa-clock"></i>
                  <span>
                    {new Date(notification.date).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
      )}
    </div>
  );
};

export default Notifications;
