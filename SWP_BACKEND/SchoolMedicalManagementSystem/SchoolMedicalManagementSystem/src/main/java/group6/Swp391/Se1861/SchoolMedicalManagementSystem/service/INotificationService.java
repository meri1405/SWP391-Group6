package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.NotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Notification;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.util.List;

public interface INotificationService {

    /**
     * Create a new notification for medication request approval/rejection
     */
    NotificationDTO createMedicationRequestNotification(
            MedicationRequest medicationRequest,
            String notificationType,
            String title,
            String message);

    /**
     * Create a new notification for medication schedule updates
     */
    NotificationDTO createMedicationScheduleNotification(
            MedicationSchedule medicationSchedule,
            String notificationType,
            String title,
            String message);

    /**
     * Create a new notification for health profile actions
     */
    NotificationDTO createHealthProfileNotification(
            HealthProfile healthProfile,
            User recipient,
            String notificationType,
            String title,
            String message);

    /**
     * Create a general notification
     */
    List<NotificationDTO> getAllNotificationsForUser(User user);

    /**
     * Get notifications for a user with pagination
     */
    List<NotificationDTO> getAllNotificationsForUser(User user, int limit);

    /**
     * Get unread notifications count for a user
     */
    List<NotificationDTO> getUnreadNotificationsForUser(User user);

    /**
     * Mark notification as read
     */
    NotificationDTO markNotificationAsRead(Long notificationId, User user);

    /**
     * Mark all notifications as read for a user
     */
    void markAllNotificationsAsRead(User user);

    /**
     * Delete a notification
     */
    long getUnreadNotificationCount(User user);

    /**
     * Delete all notifications for a user
     */
    NotificationDTO convertToDTO(Notification notification);
}
