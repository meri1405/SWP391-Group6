package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.NotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.TimeSlot;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.NotificationRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final HealthCheckFormRepository healthCheckFormRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Date formatters for consistent date formatting in notifications
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");

    /**
     * Format LocalDate to dd/MM/yyyy
     */
    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "N/A";
    }

    /**
     * Format LocalDateTime to HH:mm, dd/MM/yyyy
     */
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : "N/A";
    }

    /**
     * Create a new notification for medication request approval/rejection
     */
    @Transactional
    @Override
    public NotificationDTO createMedicationRequestNotification(
            MedicationRequest medicationRequest,
            String notificationType,
            String title,
            String message) {

        // Check if parent exists
        User parent = medicationRequest.getParent();
        if (parent == null) {
            // Log warning but continue the operation without sending WebSocket notification
            System.out.println("Warning: Cannot send notification - parent is null for medication request ID: " + medicationRequest.getId());
            return null;
        }

        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(parent);
        notification.setMedicationRequest(medicationRequest);

        Notification savedNotification = notificationRepository.save(notification);

        // Convert to DTO
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        try {
            // Send real-time notification via WebSocket
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire transaction
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }


    /**
     *  NOTIFICATION FOR UPDATE HEALTH PROFILE
     * */

    @Override
    public NotificationDTO createHealthProfileUpdateNotification(
            HealthProfile healthProfile,
            User recipient,
            String notificationType,
            String title,
            String message) {

        // Check if recipient exists
        if (recipient == null) {
            System.out.println("Warning: Cannot send notification - recipient is null for health profile ID: " + healthProfile.getId());
            return null;
        }

        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(recipient);
        // Set health profile in notification (assuming there's a field for it)
        // If there's no field for health profile in Notification, you may need to add it

        Notification savedNotification = notificationRepository.save(notification);

        // Convert to DTO
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        try {
            // Send real-time notification via WebSocket
            if (recipient.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        recipient.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire transaction
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }
    /**
     * Create a new notification for medication schedule status update
     */
    @Transactional
    @Override
    public NotificationDTO createMedicationScheduleNotification(
            MedicationSchedule medicationSchedule,
            String notificationType,
            String title,
            String message) {

        // Get the parent from the student associated with the medication request
        User parent = null;
        try {
            parent = medicationSchedule.getItemRequest().getMedicationRequest().getParent();
        } catch (NullPointerException e) {
            System.out.println("Warning: Cannot send notification - error accessing parent for medication schedule ID: " + medicationSchedule.getId());
            return null;
        }

        // Check if parent exists
        if (parent == null) {
            System.out.println("Warning: Cannot send notification - parent is null for medication schedule ID: " + medicationSchedule.getId());
            return null;
        }

        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(parent);
        notification.setMedicationSchedule(medicationSchedule);

        Notification savedNotification = notificationRepository.save(notification);

        // Convert to DTO
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        try {
            // Send real-time notification via WebSocket
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire transaction
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }

    /**
     * Create a new notification for medical events
     */
    @Transactional
    @Override
    public NotificationDTO createMedicalEventNotification(
            MedicalEvent medicalEvent,
            String notificationType,
            String title,
            String message) {

        // Get the parent from the student associated with the medical event
        User parent = null;
        try {
            parent = medicalEvent.getStudent().getParent();
        } catch (NullPointerException e) {
            System.out.println("Warning: Cannot send notification - error accessing parent for medical event ID: " + medicalEvent.getId());
            return null;
        }

        // Check if parent exists
        if (parent == null) {
            System.out.println("Warning: Cannot send notification - parent is null for medical event ID: " + medicalEvent.getId());
            return null;
        }

        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(parent);
        notification.setMedicalEvent(medicalEvent);

        Notification savedNotification = notificationRepository.save(notification);

        // Convert to DTO
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        try {
            // Send real-time notification via WebSocket
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire transaction
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }

    /**
     * Get all notifications for a user
     */
    @Override
    public List<NotificationDTO> getAllNotificationsForUser(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        return notifications.stream()
                .map(notification -> {
                    // Debug for specific notification type
                    if ("CAMPAIGN_COMPLETION_REQUEST".equals(notification.getNotificationType())) {
                        System.out.println("DEBUG: Processing CAMPAIGN_COMPLETION_REQUEST notification ID: " + notification.getId());
                        System.out.println("DEBUG: notification.getCampaignCompletionRequest() = " + 
                                         (notification.getCampaignCompletionRequest() != null ? 
                                          notification.getCampaignCompletionRequest().getId() : "NULL"));
                    }
                    return convertToDTO(notification);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all notifications for a user with limit
     */
    @Override
    public List<NotificationDTO> getAllNotificationsForUser(User user, int limit) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user,
                PageRequest.of(0, limit));
        return notifications.stream()
                .map(notification -> {
                    // Debug for specific notification type
                    if ("CAMPAIGN_COMPLETION_REQUEST".equals(notification.getNotificationType())) {
                        System.out.println("DEBUG: Processing CAMPAIGN_COMPLETION_REQUEST notification ID: " + notification.getId());
                        System.out.println("DEBUG: notification.getCampaignCompletionRequest() = " + 
                                         (notification.getCampaignCompletionRequest() != null ? 
                                          notification.getCampaignCompletionRequest().getId() : "NULL"));
                    }
                    return convertToDTO(notification);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for a user
     */
    @Override
    public List<NotificationDTO> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByRecipientAndIsReadFalse(user)
                .stream()
                .map(notification -> {
                    // Debug for specific notification type
                    if ("CAMPAIGN_COMPLETION_REQUEST".equals(notification.getNotificationType())) {
                        System.out.println("DEBUG: Processing UNREAD CAMPAIGN_COMPLETION_REQUEST notification ID: " + notification.getId());
                        System.out.println("DEBUG: notification.getCampaignCompletionRequest() = " + 
                                         (notification.getCampaignCompletionRequest() != null ? 
                                          notification.getCampaignCompletionRequest().getId() : "NULL"));
                    }
                    return convertToDTO(notification);
                })
                .collect(Collectors.toList());
    }

    /**
     * Mark a notification as read
     */
    @Transactional
    @Override
    public NotificationDTO markNotificationAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdWithAssociations(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Ensure the notification belongs to the requesting user
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setRead(true);
        return convertToDTO(notificationRepository.save(notification));
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    @Override
    public void markAllNotificationsAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository
                .findByRecipientAndIsReadFalse(user);

        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get the count of unread notifications for a user
     */
    @Override
    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    /**
     * Create a new notification for health profile actions
     */
    @Transactional
    @Override
    public NotificationDTO createHealthProfileNotification(
        
            HealthProfile healthProfile,
            User recipient,
            String notificationType,
            String title,
            String message) {

        // Check if recipient exists
        if (recipient == null) {
            System.out.println("Warning: Cannot send notification - recipient is null for health profile ID: " + healthProfile.getId());
            return null;
        }

        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(recipient);
        // Set health profile in notification (assuming there's a field for it)
        // If there's no field for health profile in Notification, you may need to add it

        Notification savedNotification = notificationRepository.save(notification);

        // Convert to DTO
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        try {
            // Send real-time notification via WebSocket
            if (recipient.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        recipient.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire transaction
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }

    /**
     * Create campaign completion notification
     */
    @Transactional
    @Override
    public NotificationDTO createCampaignCompletionNotification(
            User recipient,
            VaccinationCampaign campaign,
            User completedBy) {
        
        String title = "Thông báo hoàn tất chiến dịch tiêm chủng";

        String message = "<p>Kính gửi ban giám hiệu nhà trường,</p>" +
            "<p>Chiến dịch tiêm chủng <strong>\"" + campaign.getName() + "\"</strong> đã được hoàn tất thành công bởi nhân sự <strong>" +
            completedBy.getFullName() + "</strong> vào ngày <strong>" + formatDateTime(LocalDateTime.now()) + "</strong>.</p>" +
            "<p>Toàn bộ thông tin liên quan đến chiến dịch đã được cập nhật vào hệ thống.</p>" +
            "<p>Trân trọng,</p>" +
            "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";
        String notificationType = "CAMPAIGN_COMPLETED";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Helper method to send WebSocket notification
     */
    private void sendWebSocketNotification(Notification notification) {
        try {
            NotificationDTO notificationDTO = convertToDTO(notification);
            System.out.println("Sending WebSocket notification to user: " + notification.getRecipient().getUsername());
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipient().getUsername(),
                    "/queue/notifications",
                    notificationDTO
            );
            System.out.println("WebSocket notification sent successfully");
        } catch (Exception e) {
            System.err.println("Failed to send WebSocket notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Convert Notification entity to DTO
     */
    @Override
    public NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRead(notification.isRead());
        dto.setNotificationType(notification.getNotificationType());
        dto.setConfirm(notification.getConfirm());

        if (notification.getRecipient() != null) {
            dto.setRecipientId(notification.getRecipient().getId());
        }

        if (notification.getMedicationRequest() != null) {
            dto.setMedicationRequestId(notification.getMedicationRequest().getId());
        }

        if (notification.getMedicationSchedule() != null) {
            dto.setMedicationScheduleId(notification.getMedicationSchedule().getId());
        }

        if (notification.getMedicalEvent() != null) {
            dto.setMedicalEventId(notification.getMedicalEvent().getId());
        }
        
        if (notification.getVaccinationForm() != null) {
            dto.setVaccinationFormId(notification.getVaccinationForm().getId());
        }
        
        if (notification.getRestockRequest() != null) {
            dto.setRestockRequestId(notification.getRestockRequest().getId());
        }
        
        if (notification.getCampaignCompletionRequest() != null) {
            System.out.println("DEBUG: convertToDTO - notification.getCampaignCompletionRequest() is NOT null");
            System.out.println("DEBUG: convertToDTO - notification.getCampaignCompletionRequest().getId() = " + notification.getCampaignCompletionRequest().getId());
            dto.setCampaignCompletionRequestId(notification.getCampaignCompletionRequest().getId());
            System.out.println("DEBUG: convertToDTO - dto.getCampaignCompletionRequestId() = " + dto.getCampaignCompletionRequestId());
        } else {
            System.out.println("DEBUG: convertToDTO - notification.getCampaignCompletionRequest() is NULL");
        }

        if (notification.getHealthCheckForm() != null) {
            dto.setHealthCheckFormId(notification.getHealthCheckForm().getId());
        }

        if (notification.getHealthCheckCampaign() != null) {
            dto.setHealthCheckCampaignId(notification.getHealthCheckCampaign().getId());
        }

        return dto;
    }

    /**
     * Create vaccination form confirmation notification
     */
    @Transactional
    @Override
    public NotificationDTO createVaccinationFormConfirmationNotification(
            User recipient,
            String studentName,
            String vaccineName) {
        
        String title = "Xác nhận đồng ý tiêm chủng";

        String message = "<p>Kính gửi quý cán bộ y tế,</p>" +
        "<p>Phụ huynh đã xác nhận đồng ý cho học sinh <strong>" + studentName + "</strong> tham gia tiêm chủng với loại vắc-xin <strong>" +
        vaccineName + "</strong>.</p>" +
        "<p>Thông tin xác nhận đã được ghi nhận trong hệ thống.</p>" +
        "<p>Trân trọng,</p>" +
        "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";
        String notificationType = "VACCINATION_CONSENT_CONFIRMED";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create vaccination form decline notification
     */
    @Transactional
    @Override
    public NotificationDTO createVaccinationFormDeclineNotification(
            User recipient,
            String studentName,
            String vaccineName,
            String reason) {
        
        String title = "Thông báo từ chối tiêm chủng";

        String message = "<p>Kính gửi Quý cán bộ y tế,</p>" +
        "<p>Phụ huynh đã từ chối tiêm vắc-xin <strong>" + vaccineName + "</strong> cho học sinh <strong>" + studentName + "</strong>.</p>";

        if (reason != null && !reason.trim().isEmpty()) {
            message += "<p><strong>Lý do từ chối:</strong> " + reason + "</p>";
        }

        message += "<p>Thông tin này đã được hệ thống ghi nhận để phục vụ theo dõi và xử lý phù hợp.</p>" +
           "<p>Trân trọng,</p>" +
           "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";
        String notificationType = "VACCINATION_CONSENT_DECLINED";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create vaccination form expiry notification
     */
    @Transactional
    @Override
    public NotificationDTO createVaccinationFormExpiryNotification(
            User recipient,
            String studentName) {
        
        String title = "Thông báo phiếu tiêm chủng hết hạn";

        String message = "<p>Kính gửi Quý phụ huynh,</p>" +
        "<p>Hệ thống xin thông báo rằng mẫu đơn đồng ý tiêm chủng dành cho học sinh <strong>" + studentName + "</strong> đã quá thời hạn xác nhận.</p>" +
        "<p>Quý phụ huynh vui lòng liên hệ với nhà trường hoặc cán bộ y tế để được hỗ trợ nếu vẫn có nhu cầu đăng ký tiêm chủng.</p>" +
        "<p>Trân trọng,</p>" +
        "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";
        String notificationType = "VACCINATION_CONSENT_EXPIRED";
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create campaign approval notification
     */
    @Transactional
    @Override
    public NotificationDTO createCampaignApprovalNotification(
            User recipient,
            String campaignName,
            String approverName) {
        
        String title = "Thông báo phê duyệt chiến dịch tiêm chủng";

        String message = "<p>Kính gửi quý cán bộ y tế,</p>" +
        "<p>Chiến dịch tiêm chủng <strong>\"" + campaignName + "\"</strong> do Quý vị khởi tạo đã được chính thức phê duyệt bởi <strong>" +
        approverName + "</strong>.</p>" +
        "<p>Quý vị có thể tiến hành các bước tiếp theo theo đúng quy trình được quy định trong hệ thống.</p>" +
        "<p>Trân trọng,</p>" +
        "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";
        String notificationType = "CAMPAIGN_APPROVAL";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create campaign rejection notification
     */
    @Transactional
    @Override
    public NotificationDTO createCampaignRejectionNotification(
            User recipient,
            String campaignName,
            String reason) {
        
        String title = "Thông báo từ chối chiến dịch tiêm chủng";

        String message = "<p>Kính gửi quý cán bộ y tế,</p>" +
        "<p>Chiến dịch tiêm chủng <strong>\"" + campaignName + "\"</strong> do Quý vị khởi tạo đã không được phê duyệt.</p>" +
        "<p><strong>Lý do từ chối:</strong> " + reason + "</p>" +
        "<p>Quý vị vui lòng rà soát lại nội dung chiến dịch và điều chỉnh nếu cần thiết trước khi gửi lại để xét duyệt.</p>" +
        "<p>Trân trọng,</p>" +
        "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";

        String notificationType = "CAMPAIGN_REJECTION";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create campaign approval request notification
     */
    @Transactional
    @Override
    public NotificationDTO createCampaignApprovalRequestNotification(
            User recipient,
            String campaignName,
            String creatorName) {
        
        String title = "Thông báo chiến dịch chờ phê duyệt";

        String message = "<p>Kính gửi Ban Giám Hiệu nhà trường,</p>" +
        "<p>Một chiến dịch tiêm chủng mới với tiêu đề <strong>\"" + campaignName + "\"</strong> được khởi tạo bởi <strong>" +
        creatorName + "</strong> hiện đang chờ được phê duyệt.</p>" +
        "<p>Quý vị vui lòng truy cập hệ thống để xem xét và thực hiện phê duyệt nếu phù hợp.</p>" +
        "<p>Trân trọng,</p>" +
        "<p><em>Hệ thống Quản lý Sức khỏe Học đường (SMMS)</em></p>";

        String notificationType = "CAMPAIGN_APPROVAL_REQUEST";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create vaccination consent form notification with custom message
     */
    @Transactional
    @Override
    public NotificationDTO createVaccinationConsentFormNotification(
            User recipient,
            String studentName,
            String vaccineName,
            String location,
            String scheduledDate,
            VaccinationForm vaccinationForm,
            String customMessage) {

        String title = "Yêu cầu xác nhận tiêm chủng";

        String message;
        
        // Use custom message if provided, otherwise use default template
        if (customMessage != null && !customMessage.trim().isEmpty()) {
            message = customMessage;
        } else {
            // Default template message
            message = "<p>Kính gửi Quý phụ huynh,</p>" +
            "<p>Hệ thống trân trọng đề nghị Quý phụ huynh vui lòng xem xét và xác nhận việc tiêm chủng cho học sinh <strong>" +
            studentName + "</strong> với loại vắc-xin <strong>" + vaccineName + "</strong>";

            if (location != null && !location.trim().isEmpty()) {
                message += " tại địa điểm <strong>" + location + "</strong>";
            }
            if (scheduledDate != null && !scheduledDate.trim().isEmpty()) {
                message += " vào thời gian <strong>" + scheduledDate + "</strong>";
            }

            message += ".</p>" +
            "<p>Quý phụ huynh vui lòng thực hiện xác nhận trước thời hạn quy định để đảm bảo quyền lợi cho học sinh.</p>" +
            "<p>Trân trọng,</p>" +
            "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>";
        }
        String notificationType = "VACCINATION_CONSENT_REQUIRED";
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(recipient);
        notification.setConfirm(null); // Initially null, will be set to true/false when parent responds
        notification.setVaccinationForm(vaccinationForm);

        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        try {
            if (recipient.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        recipient.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }

    @Transactional
    @Override
    public NotificationDTO createGeneralNotification(User recipient, String title, String message, String notificationType) {
        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(recipient);

        Notification savedNotification = notificationRepository.save(notification);

        // Convert to DTO
        NotificationDTO notificationDTO = convertToDTO(savedNotification);

        // Send real-time notification via WebSocket
        try {
            if (recipient.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        recipient.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire transaction
            System.err.println("Error sending WebSocket notification: " + e.getMessage());
        }

        return notificationDTO;
    }
    
    /**
     * RESTOCK REQUEST NOTIFICATIONS
     */
    
    @Transactional
    @Override
    public void notifyManagersAboutRestockRequest(RestockRequest restockRequest) {
        // Find all managers - try with both "ROLE_MANAGER" and "MANAGER" role names
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");
        
        System.out.println("NotificationService: Found " + managers.size() + " managers to notify about restock request ID: " + restockRequest.getId());
        
        if (managers.isEmpty()) {
            System.out.println("Warning: No managers found to notify about restock request ID: " + restockRequest.getId());
            return;
        }
        
        String title = "Yêu cầu nhập kho mới";
        String message = "<p>Có yêu cầu nhập kho mới từ y tá <strong>" + 
                (restockRequest.getRequestedBy() != null ? 
                userRepository.findById(restockRequest.getRequestedBy()).map(User::getFullName).orElse("") : "") + "</strong></p>";
                
        if (restockRequest.getPriority() != null && restockRequest.getPriority().equals("HIGH") || 
            restockRequest.getPriority() != null && restockRequest.getPriority().equals("URGENT")) {
            message += "<p><span style='color: #dc3545; font-weight: bold;'>Ưu tiên: " + (restockRequest.getPriority().equals("HIGH") ? "Cao" : "Khẩn cấp") + "</span></p>";
        }
        
        System.out.println("NotificationService: Preparing notification with title: '" + title + "', message: '" + message + "'");
        
        // Notify each manager
        for (User manager : managers) {
            System.out.println("NotificationService: Creating notification for manager ID: " + manager.getId() + ", username: " + manager.getUsername());
            
            Notification notification = new Notification();
            notification.setTitle(title.trim().toUpperCase());
            notification.setMessage(message);
            notification.setNotificationType("RESTOCK_REQUEST_NEW");
            notification.setRecipient(manager);
            notification.setRestockRequest(restockRequest);
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            
            System.out.println("NotificationService: Saved notification ID: " + savedNotification.getId() + " for manager ID: " + manager.getId());
            
            // Send real-time notification via WebSocket
            try {
                if (manager.getUsername() != null) {
                    System.out.println("NotificationService: Sending WebSocket message to user: " + manager.getUsername());
                    messagingTemplate.convertAndSendToUser(
                            manager.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                    System.out.println("NotificationService: WebSocket message sent successfully to: " + manager.getUsername());
                } else {
                    System.out.println("NotificationService: Cannot send WebSocket message - username is null for manager ID: " + manager.getId());
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to manager: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    
    /**
     * Notify school nurses about a new medication request
     */
    @Transactional
    @Override
    public void notifyNursesAboutNewMedicationRequest(MedicationRequest medicationRequest) {
        // Find all school nurses
        List<User> nurses = userRepository.findByRole_RoleName("SCHOOLNURSE");
        
        System.out.println("NotificationService: Found " + nurses.size() + " nurses to notify about medication request ID: " + medicationRequest.getId());
        
        if (nurses.isEmpty()) {
            System.out.println("Warning: No school nurses found to notify about medication request ID: " + medicationRequest.getId());
            return;
        }
        
        String title = "Yêu cầu thuốc mới từ phụ huynh";
        String message = String.format(
            "<p>Phụ huynh <strong>%s</strong> đã gửi yêu cầu thuốc cho học sinh <strong>%s</strong>.</p>" +
            "<p>Vui lòng xem xét và phê duyệt yêu cầu này.</p>" +
            "<p><em>Thời gian gửi: %s</em></p>",
            medicationRequest.getParent().getFullName(),
            medicationRequest.getStudent().getFullName(),
            formatDate(medicationRequest.getRequestDate())
        );
        
        System.out.println("NotificationService: Preparing medication request notification with title: '" + title + "'");
        
        // Notify each school nurse
        for (User nurse : nurses) {
            System.out.println("NotificationService: Creating notification for nurse ID: " + nurse.getId() + ", username: " + nurse.getUsername());
            
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType("MEDICATION_REQUEST_PENDING");
            notification.setRecipient(nurse);
            notification.setMedicationRequest(medicationRequest);
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            
            System.out.println("NotificationService: Saved notification ID: " + savedNotification.getId() + " for nurse ID: " + nurse.getId());
            
            // Send real-time notification via WebSocket
            try {
                if (nurse.getUsername() != null) {
                    System.out.println("NotificationService: Sending WebSocket message to nurse: " + nurse.getUsername());
                    messagingTemplate.convertAndSendToUser(
                            nurse.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                    System.out.println("NotificationService: WebSocket message sent successfully to nurse: " + nurse.getUsername());
                } else {
                    System.out.println("NotificationService: Cannot send WebSocket message - username is null for nurse ID: " + nurse.getId());
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to nurse " + nurse.getId() + ": " + e.getMessage());
            }
        }
    }
    
    /**
     * Notify both parent and nurses about auto-rejected medication request
     */
    @Transactional
    @Override
    public void notifyAutoRejection(MedicationRequest medicationRequest) {
        System.out.println("NotificationService: Notifying about auto-rejected medication request ID: " + medicationRequest.getId());
        
        // Notify parent about auto-rejection
        if (medicationRequest.getParent() != null) {
            String parentTitle = "Yêu cầu thuốc bị từ chối tự động";
            String parentMessage = String.format(
                "<p>Yêu cầu thuốc cho học sinh <strong>%s</strong> đã bị từ chối tự động.</p>" +
                "<p><strong>Lý do:</strong> Quá thời hạn xử lý (6 giờ trước lần uống thuốc đầu tiên).</p>" +
                "<p>Để đảm bảo an toàn, vui lòng tạo yêu cầu mới với thời gian phù hợp.</p>" +
                "<p><em>Thời gian từ chối: %s</em></p>",
                medicationRequest.getStudent().getFullName(),
                formatDateTime(LocalDateTime.now())
            );
            
            Notification parentNotification = new Notification();
            parentNotification.setTitle(parentTitle);
            parentNotification.setMessage(parentMessage);
            parentNotification.setNotificationType("MEDICATION_REQUEST_AUTO_REJECTED");
            parentNotification.setRecipient(medicationRequest.getParent());
            parentNotification.setMedicationRequest(medicationRequest);
            
            Notification savedParentNotification = notificationRepository.save(parentNotification);
            NotificationDTO parentNotificationDTO = convertToDTO(savedParentNotification);
            
            // Send real-time notification to parent
            try {
                if (medicationRequest.getParent().getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            medicationRequest.getParent().getUsername(),
                            "/queue/notifications",
                            parentNotificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
            }
        }
        
        // Notify all nurses about the auto-rejection
        List<User> nurses = userRepository.findByRole_RoleName("SCHOOLNURSE");
        
        String nurseTitle = "Yêu cầu thuốc bị từ chối tự động";
        String nurseMessage = String.format(
            "<p>Yêu cầu thuốc của phụ huynh <strong>%s</strong> cho học sinh <strong>%s</strong> đã bị từ chối tự động.</p>" +
            "<p><strong>Lý do:</strong> Quá thời hạn xử lý (6 giờ trước lần uống thuốc đầu tiên).</p>" +
            "<p>Hệ thống đã tự động xử lý yêu cầu này.</p>" +
            "<p><em>Thời gian từ chối: %s</em></p>",
            medicationRequest.getParent().getFullName(),
            medicationRequest.getStudent().getFullName(),
            formatDateTime(LocalDateTime.now())
        );
        
        for (User nurse : nurses) {
            Notification nurseNotification = new Notification();
            nurseNotification.setTitle(nurseTitle);
            nurseNotification.setMessage(nurseMessage);
            nurseNotification.setNotificationType("MEDICATION_REQUEST_AUTO_REJECTED");
            nurseNotification.setRecipient(nurse);
            nurseNotification.setMedicationRequest(medicationRequest);
            
            Notification savedNurseNotification = notificationRepository.save(nurseNotification);
            NotificationDTO nurseNotificationDTO = convertToDTO(savedNurseNotification);
            
            // Send real-time notification to nurse
            try {
                if (nurse.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            nurse.getUsername(),
                            "/queue/notifications",
                            nurseNotificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to nurse " + nurse.getId() + ": " + e.getMessage());
            }
        }
    }
    
    @Transactional
    @Override
    public void notifyNurseAboutRestockRequestApproval(RestockRequest restockRequest) {
        // Find the nurse who created the request
        if (restockRequest.getRequestedBy() == null) {
            System.out.println("Warning: Cannot send notification - requestedBy is null for restock request ID: " + restockRequest.getId());
            return;
        }
        
        User nurse = userRepository.findById(restockRequest.getRequestedBy())
                .orElse(null);
        
        if (nurse == null) {
            System.out.println("Warning: Cannot find nurse with ID: " + restockRequest.getRequestedBy());
            return;
        }
        
        // Create notification
        String title = "Yêu cầu nhập kho đã được duyệt";
        String message = "<p>Yêu cầu nhập kho của bạn đã được duyệt và đã bổ sung vào kho.</p>";
        
        if (restockRequest.getReviewNotes() != null && !restockRequest.getReviewNotes().trim().isEmpty()) {
            message += "<p><strong>Ghi chú:</strong> " + restockRequest.getReviewNotes() + "</p>";
        }
        
        Notification notification = new Notification();
        notification.setTitle(title.trim().toUpperCase());
        notification.setMessage(message);
        notification.setNotificationType("RESTOCK_REQUEST_APPROVED");
        notification.setRecipient(nurse);
        notification.setRestockRequest(restockRequest);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to nurse: " + e.getMessage());
        }
    }
    
    @Transactional
    @Override
    public void notifyNurseAboutRestockRequestRejection(RestockRequest restockRequest, String notes) {
        // Find the nurse who created the request
        if (restockRequest.getRequestedBy() == null) {
            System.out.println("Warning: Cannot send notification - requestedBy is null for restock request ID: " + restockRequest.getId());
            return;
        }
        
        User nurse = userRepository.findById(restockRequest.getRequestedBy())
                .orElse(null);
        
        if (nurse == null) {
            System.out.println("Warning: Cannot find nurse with ID: " + restockRequest.getRequestedBy());
            return;
        }
        
        // Create notification
        String title = "Yêu cầu nhập kho bị từ chối";
        String message = "<p>Yêu cầu nhập kho của bạn đã bị từ chối.</p>";
        
        if (notes != null && !notes.trim().isEmpty()) {
            message += "<p><strong>Lý do:</strong> " + notes + "</p>";
        } else if (restockRequest.getReviewNotes() != null && !restockRequest.getReviewNotes().trim().isEmpty()) {
            message += "<p><strong>Lý do:</strong> " + restockRequest.getReviewNotes() + "</p>";
        }
        
        Notification notification = new Notification();
        notification.setTitle(title.trim().toUpperCase());
        notification.setMessage(message);
        notification.setNotificationType("RESTOCK_REQUEST_REJECTED");
        notification.setRecipient(nurse);
        notification.setRestockRequest(restockRequest);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to nurse: " + e.getMessage());
        }
    }
    
    /**
     * HEALTH CHECK CAMPAIGN NOTIFICATIONS
     */
    
    /**
     * Notify managers about new health check campaign pending approval
     */
    @Transactional
    @Override
    public void notifyManagersAboutHealthCheckCampaignApproval(HealthCheckCampaign campaign, int estimatedStudentCount) {
        // Find all managers
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");
        
        // If no managers found with ROLE_MANAGER, try with MANAGER
        if (managers.isEmpty()) {
            System.out.println("NotificationService: No managers found with MANAGER, trying with MANAGER");
            managers = userRepository.findByRole_RoleName("MANAGER");
        }
        
        System.out.println("NotificationService: Found " + managers.size() + " managers to notify about health check campaign ID: " + campaign.getId());
        
        if (managers.isEmpty()) {
            System.out.println("Warning: No managers found to notify about health check campaign ID: " + campaign.getId());
            return;
        }
        
        String title = "Chiến dịch khám sức khỏe cần phê duyệt";
        String message = "<p>Chiến dịch khám sức khỏe mới '<strong>" + campaign.getName() + "</strong>' được tạo bởi <strong>" + 
                (campaign.getCreatedBy() != null ? campaign.getCreatedBy().getFullName() : "Y tá trường") + 
                "</strong> đang chờ phê duyệt.</p>" +
                "<ul>" +
                "<li><strong>Số học sinh dự kiến:</strong> " + estimatedStudentCount + "</li>" +
                "<li><strong>Thời gian:</strong> " + campaign.getStartDate() + " đến " + campaign.getEndDate() + "</li>" +
                "</ul>";
        
        // Notify each manager
        for (User manager : managers) {
            Notification notification = new Notification();
            notification.setTitle(title.trim().toUpperCase());
            notification.setMessage(message);
            notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_APPROVAL_REQUEST");
            notification.setRecipient(manager);
            notification.setHealthCheckCampaign(campaign);
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            
            // Send real-time notification via WebSocket
            try {
                if (manager.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            manager.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to manager: " + e.getMessage());
            }
        }
    }
    
    /**
     * CAMPAIGN COMPLETION REQUEST NOTIFICATIONS
     */
    
    /**
     * Notify managers about a new campaign completion request
     */
    @Transactional
    @Override
    public void notifyManagersAboutCampaignCompletionRequest(CampaignCompletionRequest request) {
        // Find all manager users
        List<User> managers = userRepository.findByRole_RoleName("ROLE_MANAGER");

        for (User manager : managers) {
            try {
                // Create new notification with manual title and message that includes the notification type in title
                String notificationTitle = "CHIẾN DỊCH CHỜ PHÊ DUYỆT";
                String notificationMessage = "<p>Một chiến dịch tiêm chủng mới '<strong>YÊU CẦU HOÀN THÀNH CHIẾN DỊCH: " + 
                                           request.getCampaign().getName() + "</strong>' được tạo bởi Y tá <strong>" + 
                                           request.getRequestedBy().getFullName() + "</strong>.</p>" +
                                           "<p>Yêu cầu hoàn thành chiến dịch '<strong>" + 
                                           request.getCampaign().getName() + "</strong>' đang chờ duyệt.</p>";
                
                Notification notification = new Notification();
                notification.setTitle(notificationTitle);
                notification.setMessage(notificationMessage);
                notification.setNotificationType("completion-request");
                notification.setRecipient(manager);
                
                // Make sure to set the completion request reference properly
                notification.setCampaignCompletionRequest(request);
                
                Notification savedNotification = notificationRepository.saveAndFlush(notification);
                
                // Send WebSocket notification - directly create DTO with manual fields
                NotificationDTO notificationDTO = new NotificationDTO();
                notificationDTO.setId(savedNotification.getId());
                notificationDTO.setTitle(savedNotification.getTitle());
                notificationDTO.setMessage(savedNotification.getMessage());
                notificationDTO.setCreatedAt(savedNotification.getCreatedAt());
                notificationDTO.setRead(savedNotification.isRead());
                notificationDTO.setNotificationType(savedNotification.getNotificationType());
                notificationDTO.setConfirm(savedNotification.getConfirm());
                notificationDTO.setRecipientId(savedNotification.getRecipient().getId());
                
                // Manually set the campaignCompletionRequestId to ensure it's not null
                if (request != null && request.getId() != null) {
                    notificationDTO.setCampaignCompletionRequestId(request.getId());
                    System.out.println("DEBUG: NotificationService - Manually set DTO campaignCompletionRequestId: " + notificationDTO.getCampaignCompletionRequestId());
                } else {
                    System.out.println("DEBUG: NotificationService - WARNING - request or request.getId() is null!");
                }
                
                if (manager.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            manager.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                    System.out.println("DEBUG: NotificationService - Sent WebSocket notification to manager: " + manager.getUsername());
                }
            } catch (Exception e) {
                System.err.println("Error creating notification for manager " + manager.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    
    /**
     * Notify nurse about health check campaign approval
     */
    @Transactional
    @Override
    public void notifyNurseAboutHealthCheckCampaignApproval(HealthCheckCampaign campaign, User approver) {
        User nurse = campaign.getCreatedBy();
        if (nurse == null) {
            System.out.println("Warning: Cannot find nurse who created health check campaign ID: " + campaign.getId());
            return;
        }
        
        String title = "Chiến dịch khám sức khỏe đã được phê duyệt";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + "</strong>' của bạn đã được phê duyệt bởi <strong>" + 
                (approver != null ? approver.getFullName() : "quản lý") + "</strong>.</p>" +
                "<p>Bạn có thể bắt đầu mời phụ huynh tham gia.</p>";
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_APPROVED");
        notification.setRecipient(nurse);
        notification.setHealthCheckCampaign(campaign);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to nurse: " + e.getMessage());
        }
    }
    
    /**
     * Notify nurse about health check campaign rejection
     */
    @Transactional
    @Override
    public void notifyNurseAboutHealthCheckCampaignRejection(HealthCheckCampaign campaign, User rejector, String reason) {
        User nurse = campaign.getCreatedBy();
        if (nurse == null) {
            System.out.println("Warning: Cannot find nurse who created health check campaign ID: " + campaign.getId());
            return;
        }
        
        String title = "Chiến dịch khám sức khỏe bị từ chối";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + "</strong>' của bạn đã bị từ chối bởi <strong>" + 
                (rejector != null ? rejector.getFullName() : "quản lý") + "</strong>.</p>";
        
        if (reason != null && !reason.trim().isEmpty()) {
            message += "<p><strong>Lý do:</strong> " + reason + "</p>";
        }
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_REJECTED");
        notification.setRecipient(nurse);
        notification.setHealthCheckCampaign(campaign);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to nurse: " + e.getMessage());
        }
    }
    
    /**
     * Notify manager about health check campaign scheduling
     */
    @Transactional
    @Override
    public void notifyManagerAboutHealthCheckCampaignScheduling(HealthCheckCampaign campaign, int scheduledStudentCount) {
        // Find all managers
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");
        
        if (managers.isEmpty()) {
            managers = userRepository.findByRole_RoleName("MANAGER");
        }
        
        if (managers.isEmpty()) {
            System.out.println("Warning: No managers found to notify about health check campaign scheduling");
            return;
        }
        
        String title = "Chiến dịch khám sức khỏe đã được lên lịch";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + "</strong>' đã được lên lịch với <strong>" + 
                scheduledStudentCount + " học sinh</strong> tham gia.</p>" +
                "<p><strong>Thời gian thực hiện:</strong> " + 
                formatDate(campaign.getStartDate()) + " đến " + formatDate(campaign.getEndDate()) + "</p>";
        
        for (User manager : managers) {
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_SCHEDULED");
            notification.setRecipient(manager);
            notification.setHealthCheckCampaign(campaign);
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            
            // Send real-time notification via WebSocket
            try {
                if (manager.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            manager.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to manager: " + e.getMessage());
            }
        }
    }
    
    /**
     * Notify manager about health check campaign completion
     */
    @Transactional
    @Override
    public void notifyManagerAboutHealthCheckCampaignCompletion(HealthCheckCampaign campaign, int completedStudentCount) {
        // Find all managers
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");
        
        if (managers.isEmpty()) {
            managers = userRepository.findByRole_RoleName("MANAGER");
        }
        
        if (managers.isEmpty()) {
            System.out.println("Warning: No managers found to notify about health check campaign completion");
            return;
        }
        
        String title = "Chiến dịch khám sức khỏe đã hoàn thành";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + "</strong>' đã hoàn thành.</p>" + 
                "<p><strong>Tổng số học sinh đã khám:</strong> " + completedStudentCount + "</p>" +
                "<p>Vui lòng xem báo cáo chi tiết trong hệ thống.</p>";
        
        for (User manager : managers) {
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_COMPLETED");
            notification.setRecipient(manager);
            notification.setHealthCheckCampaign(campaign);
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            
            // Send real-time notification via WebSocket
            try {
                if (manager.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            manager.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to manager: " + e.getMessage());
            }
        }
    }
    
    /**
     * Send health check campaign invitation to parents (with customizable content)
     */
    @Transactional
    @Override
    public NotificationDTO sendHealthCheckCampaignInvitationToParent(
            User parent,
            HealthCheckCampaign campaign,
            String studentName,
            String customMessage,
            HealthCheckForm healthCheckForm) {
        
        String title = "Mời tham gia khám sức khỏe định kỳ";
        String message;
        
        if (customMessage != null && !customMessage.trim().isEmpty()) {
            message = customMessage;
        } else {
            // Default message template
            message = "<p><strong>Kính gửi phụ huynh,</strong></p>" +
                     "<p>Trường đang tổ chức chiến dịch khám sức khỏe định kỳ '<strong>" + campaign.getName() + "</strong>' " +
                     "cho học sinh <strong>" + studentName + "</strong>.</p>" +
                     "<p><strong>Thời gian dự kiến:</strong> " + formatDate(campaign.getStartDate()) + " đến " + formatDate(campaign.getEndDate()) + "</p>" +
                     "<p><strong>Các hạng mục khám:</strong> " + String.join(", ", 
                         campaign.getCategories().stream()
                             .map(category -> translateHealthCategory(category.toString()))
                             .toArray(String[]::new)) + "</p>" +
                     "<p>Vui lòng xác nhận sự tham gia của con em trong vòng 3 ngày và ít nhất 5 ngày trước khi chiến dịch bắt đầu.</p>" +
                     "<p><em>Trân trọng,<br>Y tá trường</em></p>";
        }
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_INVITATION");
        notification.setRecipient(parent);
        notification.setConfirm(null); // Will be set to true/false when parent responds
        notification.setHealthCheckCampaign(campaign);
        notification.setHealthCheckForm(healthCheckForm);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
        }
        
        return notificationDTO;
    }
    
    /**
     * Send health check appointment details to parent
     */
    @Transactional
    @Override
    public NotificationDTO sendHealthCheckAppointmentToParent(
            User parent,
            String studentName,
            String appointmentDate,
            String appointmentTime,
            String location,
            int queueNumber,
            HealthCheckCampaign campaign) {
        
        String title = "Lịch hẹn khám sức khỏe";
        String message = "<p><strong>Kính gửi phụ huynh,</strong></p>" +
                        "<p>Lịch hẹn khám sức khỏe cho học sinh <strong>" + studentName + "</strong> đã được xác định:</p>" +
                        "<ul>" +
                        "<li><strong>Ngày khám:</strong> " + appointmentDate + "</li>" +
                        "<li><strong>Thời gian:</strong> " + appointmentTime + "</li>" +
                        "<li><strong>Địa điểm:</strong> " + (location != null ? location : "Phòng y tế trường") + "</li>" +
                        "<li><strong>Số thứ tự:</strong> " + queueNumber + "</li>" +
                        "</ul>" +
                        "<p>Vui lòng đưa con đến đúng giờ để được khám sức khỏe.</p>" +
                        "<p><em>Trân trọng,<br>Y tá trường</em></p>";
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_APPOINTMENT");
        notification.setRecipient(parent);
        notification.setHealthCheckCampaign(campaign);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
        }
        
        return notificationDTO;
    }
    
    /**
     * Send health check results to a parent
     * @param parent The parent user to notify
     * @param student The student whose results are being sent
     * @param campaign The health check campaign
     * @param messageContent The detailed message content with results
     */
    @Transactional
    @Override
    public NotificationDTO sendHealthCheckResultToParent(
            User parent,
            Student student,
            HealthCheckCampaign campaign,
            String messageContent) {
        
        String title = "KẾT QUẢ KHÁM SỨC KHỎE";
        String message = messageContent;
        
        if (message == null || message.trim().isEmpty()) {
            // Generate default message if none provided
            message = "<p><strong>Kính gửi phụ huynh,</strong></p>" +
                     "<p>Kết quả khám sức khỏe của học sinh <strong>" + student.getFullName() + "</strong> " +
                     "trong chiến dịch '<strong>" + campaign.getName() + "</strong>' đã hoàn thành.</p>" +
                     "<p>Vui lòng liên hệ với y tá trường nếu bạn có bất kỳ câu hỏi nào.</p>" +
                     "<p><em>Trân trọng,<br>Y tá trường</em></p>";
        }
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_RESULT");
        notification.setRecipient(parent);
        notification.setHealthCheckCampaign(campaign);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
        }
        
        return notificationDTO;
    }
    
    /**
     * Send completion reminder to nurse
     */
    @Transactional
    @Override
    public void sendHealthCheckCampaignCompletionReminder(HealthCheckCampaign campaign) {
        User nurse = campaign.getCreatedBy();
        if (nurse == null) {
            System.out.println("Warning: Cannot find nurse for health check campaign completion reminder ID: " + campaign.getId());
            return;
        }
        
        String title = "Nhắc nhở hoàn thành chiến dịch khám sức khỏe";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + "</strong>' đã kết thúc từ <strong>" + 
                        formatDate(campaign.getEndDate()) + "</strong>.</p>" +
                        "<p>Vui lòng xác nhận hoàn thành chiến dịch trong hệ thống để cập nhật trạng thái và tạo báo cáo tổng kết.</p>";
        
        Notification notification = new Notification();
        notification.setTitle(title.trim().toUpperCase());
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_COMPLETION_REMINDER");
        notification.setRecipient(nurse);
        notification.setHealthCheckCampaign(campaign);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to nurse: " + e.getMessage());
        }
    }
    
    @Override
    public void notifyNurseAboutCampaignCompletionApproval(CampaignCompletionRequest request, User manager) {
        System.out.println("DEBUG: Creating approval notification for nurse ID: " + request.getRequestedBy().getId());
        System.out.println("DEBUG: Campaign: " + request.getCampaign().getName());
        System.out.println("DEBUG: Approved by manager: " + manager.getFullName());
        
        try {
            User nurse = request.getRequestedBy();
            
            // Create notification for the nurse
            String notificationTitle = "YÊU CẦU HOÀN THÀNH CHIẾN DỊCH ĐÃ ĐƯỢC PHÊ DUYỆT";
            String notificationMessage = "<p>Yêu cầu hoàn thành chiến dịch '<strong>" + request.getCampaign().getName() + 
                                       "</strong>' của bạn đã được quản lý <strong>" + manager.getFullName() + 
                                       "</strong> phê duyệt.</p>" +
                                       "<p>Chiến dịch đã chuyển sang trạng thái hoàn thành.</p>";
            
            Notification notification = new Notification();
            notification.setTitle(notificationTitle);
            notification.setMessage(notificationMessage);
            notification.setNotificationType("campaign-completion-approved");
            notification.setRecipient(nurse);
            notification.setCampaignCompletionRequest(request);
            
            Notification savedNotification = notificationRepository.saveAndFlush(notification);
            System.out.println("DEBUG: Saved approval notification ID: " + savedNotification.getId());
            
            // Send WebSocket notification - directly create DTO
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setId(savedNotification.getId());
            notificationDTO.setTitle(savedNotification.getTitle());
            notificationDTO.setMessage(savedNotification.getMessage());
            notificationDTO.setCreatedAt(savedNotification.getCreatedAt());
            notificationDTO.setRead(savedNotification.isRead());
            notificationDTO.setNotificationType(savedNotification.getNotificationType());
            notificationDTO.setConfirm(savedNotification.getConfirm());
            notificationDTO.setRecipientId(savedNotification.getRecipient().getId());
            notificationDTO.setCampaignCompletionRequestId(request.getId());
            
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
                System.out.println("DEBUG: Sent approval WebSocket notification to nurse: " + nurse.getUsername());
            }
        } catch (Exception e) {
            System.err.println("Error creating approval notification for nurse: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Helper method to translate health categories to Vietnamese
     */
    private String translateHealthCategory(String category) {
        switch (category.toUpperCase()) {
            case "VISION": return "Khám mắt";
            case "HEARING": return "Khám tai mũi họng";
            case "ORAL": return "Khám răng miệng";
            case "SKIN": return "Khám da liễu";
            case "RESPIRATORY": return "Khám hô hấp";
            default: return category;
        }
    }

    @Override
    public void sendHealthCheckCampaignParentConfirmation(
            HealthCheckCampaign campaign,
            User parent,
            Student student,
            String message) {
        
        String title = "Health Check Campaign - Confirmation";
        
        // Create and save notification entity
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_CONFIRMATION");
        notification.setRecipient(parent);
        notification.setHealthCheckCampaign(campaign);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
        }
    }

    @Override
    public void sendHealthCheckFormConfirmation(
            HealthCheckForm form,
            User parent,
            Student student,
            String message,
            boolean isConfirmed) {
        
        HealthCheckCampaign campaign = form.getCampaign();
        String actionText = isConfirmed ? "confirmed" : "declined";
        String parentTitle = "Chiến dịch kiểm tra sức khỏe - " + (isConfirmed ? "Xác nhận" : "Từ chối");
        String nurseTitle = "Phản hồi của phụ huynh: Mẫu kiểm tra sức khỏe " + (isConfirmed ? "đã xác nhận" : "đã từ chối");

        // 1. Send notification to parent with form and campaign reference
        Notification parentNotification = new Notification();
        parentNotification.setTitle(parentTitle);
        parentNotification.setMessage(message);
        parentNotification.setNotificationType("HEALTH_CHECK_FORM_" + (isConfirmed ? "CONFIRMATION" : "DECLINE"));
        parentNotification.setRecipient(parent);
        parentNotification.setHealthCheckCampaign(campaign);
        parentNotification.setHealthCheckForm(form);
        
        Notification savedParentNotification = notificationRepository.save(parentNotification);
        NotificationDTO parentNotificationDTO = convertToDTO(savedParentNotification);
        
        // Send real-time notification to parent
        try {
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        parentNotificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
        }

        // 2. Send notification to school nurse about parent's response
        User nurse = campaign.getCreatedBy(); // The nurse who created the campaign
        if (nurse != null) {
            String nurseMessage = String.format(
                "<p>Phụ huynh <strong>%s %s</strong> đã <strong>%s</strong> mẫu kiểm tra sức khỏe cho học sinh <strong>%s %s</strong> (Lớp: <strong>%s</strong>).</p>" +
                "<ul>" +
                "<li><strong>Chiến dịch:</strong> %s</li>" +
                "<li><strong>Mã mẫu:</strong> %d</li>" +
                "<li><strong>Ngày phản hồi:</strong> %s</li>" +
                "</ul>",
                parent.getLastName(), parent.getFirstName(),
                actionText.equals("confirmed") ? "xác nhận" : "từ chối",
                student.getLastName(), student.getFirstName(),
                student.getClassName() != null ? student.getClassName() : "N/A",
                campaign.getName(),
                form.getId(),
                formatDateTime(LocalDateTime.now())
            );
            
            Notification nurseNotification = new Notification();
            nurseNotification.setTitle(nurseTitle);
            nurseNotification.setMessage(nurseMessage);
            nurseNotification.setNotificationType("HEALTH_CHECK_FORM_PARENT_RESPONSE");
            nurseNotification.setRecipient(nurse);
            nurseNotification.setHealthCheckCampaign(campaign);
            nurseNotification.setHealthCheckForm(form);
            
            Notification savedNurseNotification = notificationRepository.save(nurseNotification);
            NotificationDTO nurseNotificationDTO = convertToDTO(savedNurseNotification);
            
            // Send real-time notification to nurse
            try {
                if (nurse.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            nurse.getUsername(),
                            "/queue/notifications",
                            nurseNotificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to nurse: " + e.getMessage());
            }
        }
    }

    @Override
    public void sendHealthCheckCampaignParentInvitation(
            HealthCheckCampaign campaign,
            User parent,
            Student student,
            String message,
            HealthCheckForm form) {
        
        String title = "Health Check Campaign - Invitation";
        
        // Create and save notification entity with form and campaign reference
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN_INVITATION");
        notification.setRecipient(parent);
        notification.setHealthCheckCampaign(campaign);
        notification.setHealthCheckForm(form);
        
        Notification savedNotification = notificationRepository.save(notification);
        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        try {
            if (parent.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        parent.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
        }
    }
    
    @Override
    public void notifyNurseAboutCampaignCompletionRejection(CampaignCompletionRequest request, User manager) {
        System.out.println("DEBUG: Creating rejection notification for nurse ID: " + request.getRequestedBy().getId());
        System.out.println("DEBUG: Campaign: " + request.getCampaign().getName());
        System.out.println("DEBUG: Rejected by manager: " + manager.getFullName());
        
        try {
            User nurse = request.getRequestedBy();
            
            // Create notification for the nurse
            String notificationTitle = "YÊU CẦU HOÀN THÀNH CHIẾN DỊCH BỊ TỪ CHỐI";
            String notificationMessage = "<p>Yêu cầu hoàn thành chiến dịch '<strong>" + request.getCampaign().getName() + 
                                       "</strong>' của bạn đã bị quản lý <strong>" + manager.getFullName() + 
                                       "</strong> từ chối.</p>" +
                                       "<p><strong>Lý do:</strong> " + request.getReviewNotes() + "</p>";
            
            Notification notification = new Notification();
            notification.setTitle(notificationTitle);
            notification.setMessage(notificationMessage);
            notification.setNotificationType("campaign-completion-rejected");
            notification.setRecipient(nurse);
            notification.setCampaignCompletionRequest(request);
            
            Notification savedNotification = notificationRepository.saveAndFlush(notification);
            System.out.println("DEBUG: Saved rejection notification ID: " + savedNotification.getId());
            
            // Send WebSocket notification - directly create DTO
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setId(savedNotification.getId());
            notificationDTO.setTitle(savedNotification.getTitle());
            notificationDTO.setMessage(savedNotification.getMessage());
            notificationDTO.setCreatedAt(savedNotification.getCreatedAt());
            notificationDTO.setRead(savedNotification.isRead());
            notificationDTO.setNotificationType(savedNotification.getNotificationType());
            notificationDTO.setConfirm(savedNotification.getConfirm());
            notificationDTO.setRecipientId(savedNotification.getRecipient().getId());
            notificationDTO.setCampaignCompletionRequestId(request.getId());
            
            if (nurse.getUsername() != null) {
                messagingTemplate.convertAndSendToUser(
                        nurse.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
                System.out.println("DEBUG: Sent rejection WebSocket notification to nurse: " + nurse.getUsername());
            }
        } catch (Exception e) {
            System.err.println("Error creating rejection notification for nurse: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void notifyNurseAboutHealthCheckCampaignScheduling(HealthCheckCampaign campaign) {
        if (campaign == null || campaign.getCreatedBy() == null) {
            return;
        }
        
        User nurse = campaign.getCreatedBy();
        String timeSlotInfo = campaign.getTimeSlot() != null ? 
                             campaign.getTimeSlot().getDisplayName() : "Cả ngày";
        
        String notificationMessage = String.format(
            "<p>Đợt khám sức khỏe \"<strong>%s</strong>\" đã được lên lịch khám chi tiết.</p>" +
            "<p><strong>Thông tin lịch:</strong></p>" +
            "<ul>" +
            "<li>Thời gian: <strong>%s</strong>, từ ngày <strong>%s</strong> đến <strong>%s</strong></li>" +
            "<li>Địa điểm: <strong>%s</strong></li>" +
            "<li>Số học sinh đã xác nhận tham gia: <strong>%d</strong></li>" +
            "</ul>" +
            "<p>Thông báo đã được gửi đến phụ huynh các học sinh tham gia.</p>",
            campaign.getName(),
            timeSlotInfo,
            formatDate(campaign.getStartDate()),
            formatDate(campaign.getEndDate()),
            campaign.getLocation(),
            campaign.getConfirmedCount()
        );

        // Create notification
        Notification notification = new Notification();
        notification.setTitle("LỊCH KHÁM SỨC KHỎE ĐÃ ĐƯỢC TẠO - " + campaign.getName());
        notification.setMessage(notificationMessage);
        notification.setNotificationType("HEALTH_CHECK_SCHEDULE");
        notification.setRecipient(nurse);
        notification.setHealthCheckCampaign(campaign);
        
        notificationRepository.save(notification);
    }
    
    /**
     * Send manager approval reminder for health check campaigns
     */
    @Transactional
    @Override
    public void sendManagerApprovalReminder(HealthCheckCampaign campaign, User manager) {
        if (manager == null) {
            System.out.println("Warning: Cannot send approval reminder - manager is null for campaign ID: " + campaign.getId());
            return;
        }

        String title = "NHẮC NHỞ PHẢN HỒI CHIẾN DỊCH";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + 
                        "</strong>' đã được tạo hơn 12 giờ và đang chờ phê duyệt của bạn.</p>" +
                        "<p>Vui lòng xem xét và phản hồi sớm nhất có thể.</p>" +
                        "<p>Nếu không có phản hồi trong vòng 24 giờ kể từ khi tạo, chiến dịch sẽ tự động bị từ chối.</p>";
        String notificationType = "CAMPAIGN_APPROVAL_REMINDER";

        // Create notification
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(manager);
        notification.setHealthCheckCampaign(campaign);

        Notification savedNotification = notificationRepository.save(notification);

        try {
            // Send real-time notification via WebSocket
            if (manager.getUsername() != null) {
                NotificationDTO notificationDTO = convertToDTO(savedNotification);
                messagingTemplate.convertAndSendToUser(
                        manager.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
                System.out.println("Manager approval reminder sent to: " + manager.getUsername() + 
                                 " for campaign: " + campaign.getName());
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification for manager approval reminder: " + e.getMessage());
        }
    }

    /**
     * Send auto-rejection notification for health check campaigns
     */
    @Transactional
    @Override
    public void sendCampaignAutoRejectionNotification(HealthCheckCampaign campaign, User creator) {
        if (creator == null) {
            System.out.println("Warning: Cannot send auto-rejection notification - creator is null for campaign ID: " + campaign.getId());
            return;
        }

        String title = "CHIẾN DỊCH TỰ ĐỘNG BỊ TỪ CHỐI";
        String message = "<p>Chiến dịch khám sức khỏe '<strong>" + campaign.getName() + 
                        "</strong>' đã bị từ chối tự động do không nhận được phản hồi từ quản lý trong vòng 24 giờ.</p>" +
                        "<p>Bạn có thể tạo chiến dịch mới nếu cần thiết.</p>" +
                        "<p>Thời gian từ chối: <strong>" + formatDateTime(LocalDateTime.now()) + "</strong></p>";
        String notificationType = "CAMPAIGN_AUTO_REJECTED";

        // Create notification
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(creator);
        notification.setHealthCheckCampaign(campaign);

        Notification savedNotification = notificationRepository.save(notification);

        try {
            // Send real-time notification via WebSocket
            if (creator.getUsername() != null) {
                NotificationDTO notificationDTO = convertToDTO(savedNotification);
                messagingTemplate.convertAndSendToUser(
                        creator.getUsername(),
                        "/queue/notifications",
                        notificationDTO
                );
                System.out.println("Auto-rejection notification sent to: " + creator.getUsername() + 
                                 " for campaign: " + campaign.getName());
            }
        } catch (Exception e) {
            System.err.println("Error sending WebSocket notification for auto-rejection: " + e.getMessage());
        }
    }

    /**
     * Send health check schedule notification to parents
     */
    @Transactional
    public void notifyParentsAboutHealthCheckSchedule(HealthCheckCampaign campaign) {
        // Get all confirmed health check forms for this campaign
        List<HealthCheckForm> confirmedForms = healthCheckFormRepository
                .findByCampaignAndStatus(campaign, FormStatus.CONFIRMED);
        
        if (confirmedForms.isEmpty()) {
            System.out.println("No confirmed forms found for campaign: " + campaign.getName());
            return;
        }
        
        // Get time slot text in Vietnamese
        String timeSlotText = getTimeSlotText(campaign.getTimeSlot());
        
        // Send notification to each parent
        for (HealthCheckForm form : confirmedForms) {
            User parent = form.getParent();
            Student student = form.getStudent();
            
            // Create detailed schedule message
            String title = "LỊCH KHÁM SỨC KHỎE - " + student.getFullName().toUpperCase();
            String message = String.format(
                "<p><strong>Thân gửi Quý phụ huynh,</strong></p>" +
                "<p>Nhà trường thông báo lịch khám sức khỏe của đợt khám \"<strong>%s</strong>\".</p>" +
                "<h4 style='margin-top: 0; color: #007bff;'>Thông tin lịch khám:</h4>" +
                "<ul style='margin: 10px 0;'>" +
                "<li><strong>Thời gian:</strong> %s</li>" +
                "<li><strong>Ngày giờ cụ thể:</strong> %s %s</li>" +
                "<li><strong>Địa điểm:</strong> %s</li>" +
                "<li><strong>Thứ tự khám:</strong> %d</li>" +
                "<li><strong>Học sinh:</strong> %s - Lớp %s</li>" +
                "</ul>" +
                "%s" +
                "<p>Xin vui lòng chuẩn bị đầy đủ thông tin sức khỏe cơ bản và đưa học sinh đến đúng giờ.</p>" +
                "<p><em>Trân trọng,<br>Ban Giám hiệu</em></p>",
                campaign.getName(),
                timeSlotText,
                formatDate(campaign.getStartDate()),
                getTimeSlotTimeText(campaign.getTimeSlot()),
                campaign.getLocation(),
                getStudentOrder(confirmedForms, student),
                student.getFullName(),
                student.getClassName(),
                campaign.getScheduleNotes() != null ? "<p><strong>Lưu ý:</strong> " + campaign.getScheduleNotes() + "</p>" : ""
            );
            
            // Create notification
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType("HEALTH_CHECK_SCHEDULE");
            notification.setRecipient(parent);
            notification.setHealthCheckCampaign(campaign);
            notification.setHealthCheckForm(form);
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            
            // Send real-time notification via WebSocket
            try {
                if (parent.getUsername() != null) {
                    messagingTemplate.convertAndSendToUser(
                            parent.getUsername(),
                            "/queue/notifications",
                            notificationDTO
                    );
                }
            } catch (Exception e) {
                System.err.println("Error sending WebSocket notification to parent: " + e.getMessage());
            }
        }
    }
    
    private String getTimeSlotText(TimeSlot timeSlot) {
        if (timeSlot == null) return "Chưa xác định";
        switch (timeSlot) {
            case MORNING: return "Sáng";
            case AFTERNOON: return "Chiều";
            case BOTH: return "Cả ngày";
            default: return "Chưa xác định";
        }
    }
    
    private String getTimeSlotTimeText(TimeSlot timeSlot) {
        if (timeSlot == null) return "00:00";
        switch (timeSlot) {
            case MORNING: return "08:00";
            case AFTERNOON: return "14:00";
            case BOTH: return "08:00";
            default: return "08:00";
        }
    }
    
    private int getStudentOrder(List<HealthCheckForm> forms, Student student) {
        // Sort forms by student name and find the order
        forms.sort((f1, f2) -> f1.getStudent().getFullName().compareTo(f2.getStudent().getFullName()));
        for (int i = 0; i < forms.size(); i++) {
            if (forms.get(i).getStudent().getStudentID().equals(student.getStudentID())) {
                return i + 1;
            }
        }
        return 1;
    }
}

