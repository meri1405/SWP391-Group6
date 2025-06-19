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
        dto.setRecipientId(notification.getRecipient().getId());
        dto.setConfirm(notification.getConfirm());

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
        
        String title = "Vaccination Consent Confirmed";
        String message = "Parent has confirmed vaccination for " + studentName + " - " + vaccineName;
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
        
        String title = "Vaccination Consent Declined";
        String message = "Parent has declined vaccination for " + studentName + " - " + vaccineName;
        if (reason != null && !reason.trim().isEmpty()) {
            message += ". Reason: " + reason;
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
        
        String title = "Vaccination Form Expired";
        String message = "Vaccination consent form for " + studentName + " has expired without response";
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
        
        String title = "Campaign Approved";
        String message = "Your vaccination campaign '" + campaignName + "' has been approved by " + approverName;
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
        
        String title = "Campaign Rejected";
        String message = "Your vaccination campaign '" + campaignName + "' has been rejected. Reason: " + reason;
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
        
        String title = "New Campaign Pending Approval";
        String message = "A new vaccination campaign '" + campaignName + "' created by " + creatorName + " is pending your approval.";
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
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRecipient(recipient);

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
}

