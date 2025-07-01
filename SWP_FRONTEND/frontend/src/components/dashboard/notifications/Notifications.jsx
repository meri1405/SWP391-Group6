import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import { nurseApi } from "../../../api/nurseApi";
import managerApi from "../../../api/managerApi";
import webSocketService from "../../../services/webSocketService";
import { VaccinationFormModal } from "../vaccinations";
import HealthCheckFormModal from "./HealthCheckFormModal";
import "../../../styles/Notifications.css";

const Notifications = ({ role = "parent" }) => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedVaccinationFormId, setSelectedVaccinationFormId] =
    useState(null);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [selectedHealthCheckForm, setSelectedHealthCheckForm] = useState(null);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const { getToken } = useAuth();

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

    // Check title and message content for additional clues
    const titleLower = notification.title?.toLowerCase() || "";
    const messageLower = notification.message?.toLowerCase() || "";

    // Check for health check notifications
    if (
      titleLower.includes("khám sức khỏe") ||
      titleLower.includes("health check") ||
      messageLower.includes("khám sức khỏe") ||
      messageLower.includes("health check") ||
      titleLower.includes("thông báo khám sức khỏe") ||
      messageLower.includes("kiểm tra sức khỏe") ||
      notification.notificationType === "HEALTH_CHECK_NOTIFICATION" ||
      notification.notificationType === "HEALTH_CHECK_CAMPAIGN"
    ) {
      return "health";
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
    // Health check notifications also require parent action (view details and respond)

    const notificationType = getNotificationType(notification);

    return (
      notification.medicationRequest ||
      notification.medicationSchedule ||
      notification.vaccinationFormId ||
      notificationType === "health"
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
  // Load health check form details
  const loadHealthCheckFormDetails = async (notification) => {
    try {
      setHealthCheckLoading(true);
      const token = getToken();

      console.log(
        "Loading health check details for notification:",
        notification
      );

      // Get all health check forms for parent
      const healthCheckForms = await parentApi.getHealthCheckForms(token);
      console.log("Available health check forms:", healthCheckForms);

      // Handle different response formats
      let formsArray = [];
      if (Array.isArray(healthCheckForms)) {
        formsArray = healthCheckForms;
      } else if (healthCheckForms && typeof healthCheckForms === "object") {
        // If it's a single object, wrap it in an array
        formsArray = [healthCheckForms];
      } else if (typeof healthCheckForms === "string") {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(healthCheckForms);
          formsArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error("Failed to parse health check forms JSON:", e);
          throw new Error("Invalid JSON response from server");
        }
      } else {
        console.warn("Health check forms is not an array:", healthCheckForms);
        throw new Error(
          "Invalid response format from server - expected array but got: " +
            typeof healthCheckForms
        );
      }

      // Try multiple strategies to find matching form
      let matchingForm = null;

      // Strategy 1: Find most recent PENDING form
      const pendingForms = formsArray.filter(
        (form) => form.status === "PENDING"
      );
      if (pendingForms.length > 0) {
        // Sort by creation date and get the most recent
        matchingForm = pendingForms.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        console.log("Found matching form by PENDING status:", matchingForm);
      }

      // Strategy 2: If no pending forms, try to match by message content
      if (!matchingForm) {
        const notificationMessage = notification.message?.toLowerCase() || "";
        const notificationTitle = notification.title?.toLowerCase() || "";

        matchingForm = formsArray.find((form) => {
          const studentName = form.student?.fullName?.toLowerCase() || "";
          const campaignName = form.campaign?.name?.toLowerCase() || "";

          return (
            notificationMessage.includes(studentName) ||
            notificationMessage.includes(campaignName) ||
            notificationTitle.includes(studentName) ||
            notificationTitle.includes(campaignName)
          );
        });
        console.log("Found matching form by content:", matchingForm);
      }

      // Strategy 3: If still no match, get the most recent form
      if (!matchingForm && formsArray.length > 0) {
        matchingForm = formsArray.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        console.log("Using most recent form as fallback:", matchingForm);
      }

      if (matchingForm) {
        console.log("Setting selected form:", matchingForm);

        // Check if form has valid ID before calling API
        if (!matchingForm.id) {
          console.warn("Form found but has no valid ID:", matchingForm);
          // Skip API call and use basic form
        } else {
          // Try to get detailed form information from NURSE using new API
          try {
            console.log(
              "Attempting to get form details for formId:",
              matchingForm.id
            );
            const formDetails = await parentApi.getHealthCheckFormDetails(
              matchingForm.id,
              token
            );
            console.log("Got detailed form info from nurse:", formDetails);

            // Check if we got valid data
            if (!formDetails || !formDetails.formId) {
              console.warn("Form details is empty or invalid:", formDetails);
              throw new Error("Invalid form details received");
            }

            // Replace the basic form with detailed information
            matchingForm = {
              id: formDetails.formId,
              status: formDetails.status,
              campaign: {
                id: formDetails.campaignId,
                name: formDetails.campaignName || "Đợt khám sức khỏe",
                description: formDetails.campaignDescription,
                startDate: formDetails.campaignStartDate,
                endDate: formDetails.campaignEndDate,
                location: formDetails.campaignLocation || "Tại trường",
                minAge: formDetails.minAge,
                maxAge: formDetails.maxAge,
                targetClasses: formDetails.targetClasses || new Set(),
                status: formDetails.campaignStatus,
                createdAt: formDetails.campaignCreatedAt,
                createdBy: {
                  fullName: formDetails.nurseFullName || "Y tá trường",
                  email: formDetails.nurseEmail,
                  phone: formDetails.nursePhone,
                },
                // Keep detailed information from nurse
                nurseDescription: formDetails.campaignDescription,
                nurseInstructions: formDetails.specialNotes,
                detailedInstructions: formDetails.detailedInstructions,
                detailedInfo: true,
              },
              student: {
                id: formDetails.studentId,
                fullName: formDetails.studentFullName || "Học sinh",
                className: formDetails.studentClassName || "Chưa xác định",
                age: formDetails.studentAge,
                gender: formDetails.studentGender,
              },
              parent: {
                id: formDetails.parentId,
                fullName: formDetails.parentFullName,
                email: formDetails.parentEmail,
                phone: formDetails.parentPhone,
              },
              appointmentTime: formDetails.appointmentTime,
              appointmentLocation:
                formDetails.appointmentLocation || "Tại trường",
              sentAt: formDetails.sentAt,
              respondedAt: formDetails.respondedAt,
              parentNote: formDetails.parentNote,
              deadline: formDetails.deadline,
              isUrgent: formDetails.isUrgent,
            };
          } catch (error) {
            console.log(
              "Could not get detailed form info from nurse, using basic form data:",
              error
            );
          }
        }

        setSelectedHealthCheckForm(matchingForm);
        setShowHealthCheckModal(true);
      } else {
        console.log("No forms found, attempting to auto-generate...");

        try {
          // Try to auto-generate a health check form
          const autoGenResult = await parentApi.autoGenerateHealthCheckForm();
          console.log("Auto-generated form result:", autoGenResult);

          if (autoGenResult && autoGenResult.form) {
            // Use the auto-generated form
            setSelectedHealthCheckForm(autoGenResult.form);
            setShowHealthCheckModal(true);
          } else {
            throw new Error("Auto-generation returned no form data");
          }
        } catch (autoGenError) {
          console.error("Error auto-generating form:", autoGenError);
          console.log(
            "Creating basic form from notification as final fallback"
          );

          // Final fallback: Create enhanced form object with better data extraction
          const basicForm = {
            id: null,
            status: "PENDING",
            campaign: {
              name: extractCampaignName(notification) || "Đợt khám sức khỏe",
              description:
                notification.message ||
                "Trường đang tổ chức đợt khám sức khỏe cho học sinh. Vui lòng xác nhận đồng ý hoặc từ chối khám cho con em mình.",
              targetClasses: "Tất cả các lớp",
              startDate: null,
              endDate: null,
            },
            student: {
              fullName: extractStudentName(notification) || "Học sinh Demo",
              className: "Lớp 5A",
            },
            appointmentTime: null,
            appointmentLocation: "Tại trường",
            createdAt: notification.date,
            parentNote: null,
          };
          setSelectedHealthCheckForm(basicForm);
          setShowHealthCheckModal(true);
        }
      }
    } catch (error) {
      console.error("Error loading health check form details:", error);
      // Enhanced fallback with better error handling
      const enhancedForm = {
        id: null,
        status: "PENDING",
        campaign: {
          name: extractCampaignName(notification) || "Đợt khám sức khỏe",
          description:
            notification.message ||
            "Có lỗi khi tải thông tin chi tiết. Vui lòng thử lại hoặc liên hệ y tá trường để biết thêm thông tin.",
          targetClasses: "Chưa xác định",
        },
        student: {
          fullName: extractStudentName(notification) || "Học sinh của bạn",
          className: "Chưa xác định",
        },
        appointmentTime: null,
        appointmentLocation: "Tại trường",
        createdAt: notification.date,
        parentNote: null,
        error: true,
      };
      setSelectedHealthCheckForm(enhancedForm);
      setShowHealthCheckModal(true);
    } finally {
      setHealthCheckLoading(false);
    }
  };

  // Helper function to extract campaign name from notification
  const extractCampaignName = (notification) => {
    const message = notification.message || "";
    const title = notification.title || "";

    // Look for patterns like "campaign name" or specific keywords
    if (message.includes("đợt khám") || title.includes("đợt khám")) {
      // Try to extract campaign name between quotes or after keywords
      const campaignMatch =
        message.match(/["'](.*?)["']/) || title.match(/["'](.*?)["']/);
      if (campaignMatch) {
        return campaignMatch[1];
      }
    }

    return null;
  };

  // Helper function to extract student name from notification
  const extractStudentName = (notification) => {
    const message = notification.message || "";

    // Look for patterns like "học sinh [Name]" or "cho [Name]"
    const nameMatch =
      message.match(/học sinh\s+([A-Za-zÀ-ÿ\s]+)/i) ||
      message.match(/cho\s+([A-Za-zÀ-ÿ\s]+)/i);

    if (nameMatch) {
      return nameMatch[1].trim();
    }

    return null;
  };

  const confirmAction = (notification) => {
    // Handle different types of confirmations based on notification type
    const notificationType = getNotificationType(notification);

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
    } else if (notificationType === "health") {
      // For health check notifications, show modal with details
      if (role === "parent" || !role) {
        loadHealthCheckFormDetails(notification);
      } else {
        console.log(
          "Health check notification action for role:",
          role,
          notification
        );
      }
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
      {/* Health Check Form Modal */}
      {showHealthCheckModal && selectedHealthCheckForm && (
        <HealthCheckFormModal
          isOpen={showHealthCheckModal}
          healthCheckForm={selectedHealthCheckForm}
          onClose={() => {
            setShowHealthCheckModal(false);
            setSelectedHealthCheckForm(null);
          }}
          onFormUpdated={() => {
            loadNotifications(); // Refresh notifications
            setShowHealthCheckModal(false);
            setSelectedHealthCheckForm(null);
          }}
          loading={healthCheckLoading}
        />
      )}
    </div>
  );
};

export default Notifications;
