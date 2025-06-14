package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.NotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Notification;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
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
    }    /**
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
        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user)
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
                .findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);

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

        if (notification.getMedicationRequest() != null) {
            dto.setMedicationRequestId(notification.getMedicationRequest().getId());
        }

        if (notification.getMedicationSchedule() != null) {
            dto.setMedicationScheduleId(notification.getMedicationSchedule().getId());
        }

        return dto;
    }
}
