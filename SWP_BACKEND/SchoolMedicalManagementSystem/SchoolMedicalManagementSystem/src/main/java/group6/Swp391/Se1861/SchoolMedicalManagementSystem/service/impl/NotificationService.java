package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.NotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.NotificationRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
                        "/topic/notifications",
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
                        "/topic/notifications",
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
                        "/topic/notifications",
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
                        "/topic/notifications",
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
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all notifications for a user with limit
     */
    @Override
    public List<NotificationDTO> getAllNotificationsForUser(User user, int limit) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user,
                PageRequest.of(0, limit))
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for a user
     */
    @Override
    public List<NotificationDTO> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByRecipientAndIsReadFalse(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark a notification as read
     */
    @Transactional
    @Override
    public NotificationDTO markNotificationAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
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
                        "/topic/notifications",
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
     * Notify managers about a campaign pending approval
     */
    @Transactional
    @Override
    public void notifyManagersAboutCampaignApproval(HealthCheckCampaign campaign) {
        // Find all manager users
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");

        for (User manager : managers) {
            Notification notification = new Notification();
            notification.setTitle("CHIẾN DỊCH KHÁM SỨC KHỎE ĐANG CHỜ PHÊ DUYỆT");
            notification.setMessage("Một chiến dịch kiểm tra sức khỏe mới '" + campaign.getName() + "' đang chờ phê duyệt.");
            notification.setNotificationType("CAMPAIGN_PENDING_APPROVAL");
            notification.setRecipient(manager);

            Notification savedNotification = notificationRepository.save(notification);

            // Send WebSocket notification
            sendWebSocketNotification(savedNotification);
        }
    }

    /**
     * Notify nurse about campaign approval
     */
    @Transactional
    @Override
    public void notifyNurseAboutCampaignApproval(HealthCheckCampaign campaign) {
        User nurse = campaign.getCreatedBy();

        Notification notification = new Notification();
        notification.setTitle("CHIẾN DỊCH KHÁM SỨC KHỎE ĐƯỢC CHẤP NHẬN");
        notification.setMessage("Chiến dịch kiểm tra sức khỏe của bạn '" + campaign.getName() + "' đã được chấp nhận.");
        notification.setNotificationType("CAMPAIGN_APPROVED");
        notification.setRecipient(nurse);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify nurse about campaign rejection
     */
    @Transactional
    @Override
    public void notifyNurseAboutCampaignRejection(HealthCheckCampaign campaign, String notes) {
        User nurse = campaign.getCreatedBy();

        Notification notification = new Notification();
        notification.setTitle("CHIẾN DỊCH KHÁM SỨC KHỎE CẦN ĐƯỢC THAY ĐỔI");
        notification.setMessage("Chiến dịch kiểm tra sức khỏe của bạn '" + campaign.getName() +
                "' được yêu cầu thay đổi. Ghi chú: " + notes);
        notification.setNotificationType("CAMPAIGN_REJECTED");
        notification.setRecipient(nurse);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify manager about campaign scheduling
     */
    @Transactional
    @Override
    public void notifyManagerAboutCampaignSchedule(HealthCheckCampaign campaign) {
        User approver = campaign.getApprovedBy();
        if (approver == null) {
            return; // No approver to notify
        }

        Notification notification = new Notification();
        notification.setTitle("CHIẾN DỊCH KHÁM SỨC KHỎE ĐÃ ĐƯỢC LÊN LỊCH");
        notification.setMessage("Chiến dịch kiểm tra sức khỏe '" + campaign.getName() +
                "' đã được lên lịch với số lượng học sinh là " + campaign.getTargetCount() + " .");
        notification.setNotificationType("CAMPAIGN_SCHEDULED");
        notification.setRecipient(approver);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify manager about campaign completion
     */
    @Transactional
    @Override
    public void notifyManagerAboutCampaignCompletion(HealthCheckCampaign campaign) {
        User approver = campaign.getApprovedBy();
        if (approver == null) {
            return; // No approver to notify
        }

        Notification notification = new Notification();
        notification.setTitle("CHIẾN DỊCH KHÁM SỨC KHỎE ĐÃ HOÀN THÀNH");
        notification.setMessage("Chiến dịch kiểm tra sức khỏe '" + campaign.getName() + "' đã được hoàn thành.");
        notification.setNotificationType("CAMPAIGN_COMPLETED");
        notification.setRecipient(approver);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify parent about health check
     */
    @Transactional
    @Override
    public void notifyParentAboutHealthCheck(HealthCheckForm form) {
        User parent = form.getParent();
        Student student = form.getStudent();
        HealthCheckCampaign campaign = form.getCampaign();

        Notification notification = new Notification();
        notification.setTitle("THÔNG BÁO KHÁM SỨC KHỎE");
        notification.setMessage("Học sinh " + student.getFullName() + " có lịch kiểm tra sức khỏe: '" +
                campaign.getName() + "'. Vui lòng xác nhận đồng ý hoặc từ chối.");
        notification.setNotificationType("HEALTH_CHECK_NOTIFICATION");
        notification.setRecipient(parent);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify nurse about parent confirmation
     */
    @Transactional
    @Override
    public void notifyNurseAboutParentConfirmation(HealthCheckForm form) {
        User nurse = form.getCampaign().getCreatedBy();
        Student student = form.getStudent();

        Notification notification = new Notification();
        notification.setTitle("XÁC NHẬN ĐỒNG Ý KHÁM SỨC KHỎE");
        notification.setMessage("Phụ huynh đã xác nhận kiểm tra sức khỏe cho học sinh: " + student.getFullName());
        notification.setNotificationType("HEALTH_CHECK_CONFIRMED");
        notification.setRecipient(nurse);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify parent about abnormal health check result
     */
    @Transactional
    @Override
    public void notifyParentAboutAbnormalResult(HealthCheckResult result) {
        User parent = result.getStudent().getParent();
        if (parent == null) {
            return; // No parent to notify
        }

        Notification notification = new Notification();
        notification.setTitle("KẾT QUẢ KHÁM SỨC KHỎE");
        notification.setMessage("Học sinh " + result.getStudent().getFullName() +
                " có một số vấn đề về " + result.getCategory().toString().toLowerCase() + " trong kết quả khám sức khỏe.");
        notification.setNotificationType("ABNORMAL_HEALTH_RESULT");
        notification.setRecipient(parent);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Notify manager about abnormal health check result
     */
    @Transactional
    @Override
    public void notifyManagerAboutAbnormalResult(HealthCheckResult result) {
        User manager = result.getForm().getCampaign().getApprovedBy();
        if (manager == null) {
            return; // No manager to notify
        }

        Notification notification = new Notification();
        notification.setTitle("KẾT QUẢ KHÁM SỨC KHỎE");
        notification.setMessage("Học sinh " + result.getStudent().getFullName() +
                " có một số bất thường " + result.getCategory().toString().toLowerCase() + " trong kết quả kiểm tra sức khỏe.");
        notification.setNotificationType("MANAGER_ABNORMAL_RESULT");
        notification.setRecipient(manager);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }
    
    /**
     * Notify parent about appointment scheduling
     */
    @Transactional
    @Override
    public void notifyParentAboutAppointment(HealthCheckForm form) {
        User parent = form.getParent();
        Student student = form.getStudent();

        if (parent == null) {
            return; // No parent to notify
        }

        Notification notification = new Notification();
        notification.setTitle("ĐÃ LÊN LỊCH HẸN KHÁM SỨC KHỎE");
        notification.setMessage("Một cuộc hẹn khám sức khỏe đã được lên lịch cho " + student.getFullName() +
                " vào " + form.getAppointmentTime().toLocalDate() +
                " lúc " + form.getAppointmentTime().toLocalTime() +
                ". Địa điểm: " + form.getAppointmentLocation());
        notification.setNotificationType("APPOINTMENT_SCHEDULED");
        notification.setRecipient(parent);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        sendWebSocketNotification(savedNotification);
    }

    /**
     * Helper method to send WebSocket notification
     */
    private void sendWebSocketNotification(Notification notification) {
        try {
            NotificationDTO notificationDTO = convertToDTO(notification);
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipient().getEmail(),
                    "/queue/notifications",
                    notificationDTO
            );
        } catch (Exception e) {
            System.err.println("Failed to send WebSocket notification: " + e.getMessage());
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

        if (notification.getHealthCheckForm() != null) {
            dto.setHealthCheckFormId(notification.getHealthCheckForm().getId());
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
        
        String title = "XÁC NHẬN ĐỒNG Ý TIÊM CHỦNG";
        String message = "Phụ huynh đã xác nhận tiêm chủng cho " + studentName + " - " + vaccineName;
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
        
        String title = "TỪ CHỐI TIÊM CHỦNG";
        String message = "Cha mẹ đã từ chối tiêm vắc-xin cho " + studentName + " - " + vaccineName;
        if (reason != null && !reason.trim().isEmpty()) {
            message += ". Lý do: " + reason;
        }
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
        
        String title = "PHIẾU TIÊM CHỦNG HẾT HẠN";
        String message = "Mẫu đơn đồng ý tiêm chủng cho " + studentName + " đã quá thời hạn xác nhận";
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
        
        String title = "CHIẾN DỊCH ĐÃ ĐƯỢC CHẤP NHẬN";
        String message = "Chiến dịch tiêm chủng của bạn '" + campaignName + "' đã được chấp nhận bởi " + approverName;
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
        
        String title = "CHIẾN DỊCH ĐÃ BỊ TỪ CHỐI";
        String message = "Chiến dịch tiêm chủng của bạn '" + campaignName + "' đã bị từ chối. Lý do: " + reason;
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
        
        String title = "CHIẾN DỊCH CHỜ PHÊ DUYỆT";
        String message = "Một chiến dịch tiêm chủng mới '" + campaignName + "' được tạo bởi  " + creatorName + " đang chờ duyệt.";
        String notificationType = "CAMPAIGN_APPROVAL_REQUEST";
        
        return createGeneralNotification(recipient, title, message, notificationType);
    }

    /**
     * Create vaccination consent form notification
     */
    @Transactional
    @Override
    public NotificationDTO createVaccinationConsentFormNotification(
            User recipient,
            String studentName,
            String vaccineName,
            String location,
            String scheduledDate,
            VaccinationForm vaccinationForm) {

        String title = "XÁC NHẬN ĐỒNG Ý TIÊM CHỦNG";
        String message = "Vui lòng xem xét và xác nhận tiêm chủng cho " + studentName + " - " + vaccineName;
        if (location != null && !location.trim().isEmpty()) {
            message += " tại " + location;
        }
        if (scheduledDate != null && !scheduledDate.trim().isEmpty()) {
            message += " vào " + scheduledDate;
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
                        "/topic/notifications",
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
        List<User> managers = userRepository.findByRole_RoleName("ROLE_MANAGER");
        
        // If no managers found with ROLE_MANAGER, try with MANAGER
        if (managers.isEmpty()) {
            System.out.println("NotificationService: No managers found with ROLE_MANAGER, trying with MANAGER");
            managers = userRepository.findByRole_RoleName("MANAGER");
        }
        
        System.out.println("NotificationService: Found " + managers.size() + " managers to notify about restock request ID: " + restockRequest.getId());
        
        if (managers.isEmpty()) {
            System.out.println("Warning: No managers found to notify about restock request ID: " + restockRequest.getId());
            return;
        }
        
        String title = "Yêu cầu nhập kho mới";
        String message = "Có yêu cầu nhập kho mới từ y tá " + 
                (restockRequest.getRequestedBy() != null ? 
                userRepository.findById(restockRequest.getRequestedBy()).map(User::getFullName).orElse("") : "");
                
        if (restockRequest.getPriority() != null && restockRequest.getPriority().equals("HIGH") || 
            restockRequest.getPriority() != null && restockRequest.getPriority().equals("URGENT")) {
            message += " (Ưu tiên: " + (restockRequest.getPriority().equals("HIGH") ? "Cao" : "Khẩn cấp") + ")";
        }
        
        System.out.println("NotificationService: Preparing notification with title: '" + title + "', message: '" + message + "'");
        
        // Notify each manager
        for (User manager : managers) {
            System.out.println("NotificationService: Creating notification for manager ID: " + manager.getId() + ", username: " + manager.getUsername());
            
            Notification notification = new Notification();
            notification.setTitle(title);
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
        String message = "Yêu cầu nhập kho của bạn đã được duyệt và đã bổ sung vào kho.";
        
        if (restockRequest.getReviewNotes() != null && !restockRequest.getReviewNotes().trim().isEmpty()) {
            message += " Ghi chú: " + restockRequest.getReviewNotes();
        }
        
        Notification notification = new Notification();
        notification.setTitle(title);
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
        String message = "Yêu cầu nhập kho của bạn đã bị từ chối.";
        
        if (notes != null && !notes.trim().isEmpty()) {
            message += " Lý do: " + notes;
        } else if (restockRequest.getReviewNotes() != null && !restockRequest.getReviewNotes().trim().isEmpty()) {
            message += " Lý do: " + restockRequest.getReviewNotes();
        }
        
        Notification notification = new Notification();
        notification.setTitle(title);
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
}

