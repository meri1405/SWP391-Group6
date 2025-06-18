package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.NotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;

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
     * Create a new notification for medical events
     */
    NotificationDTO createMedicalEventNotification(
        MedicalEvent medicalEvent,
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
    NotificationDTO createGeneralNotification(
            User recipient,
            String title,
            String message,
            String notificationType);

    /**
     * Create vaccination form confirmation notification
     */
    NotificationDTO createVaccinationFormConfirmationNotification(
            User recipient,
            String studentName,
            String vaccineName);

    /**
     * Create vaccination form decline notification
     */
    NotificationDTO createVaccinationFormDeclineNotification(
            User recipient,
            String studentName,
            String vaccineName,
            String reason);

    /**
     * Create vaccination form expiry notification
     */
    NotificationDTO createVaccinationFormExpiryNotification(
            User recipient,
            String studentName);

    /**
     * Create campaign approval notification
     */
    NotificationDTO createCampaignApprovalNotification(
            User recipient,
            String campaignName,
            String approverName);

    /**
     * Create campaign rejection notification
     */
    NotificationDTO createCampaignRejectionNotification(
            User recipient,
            String campaignName,
            String reason);

    /**
     * Create campaign approval request notification
     */
    NotificationDTO createCampaignApprovalRequestNotification(
            User recipient,
            String campaignName,
            String creatorName);

    /**
     * Create vaccination consent form notification
     */
    NotificationDTO createVaccinationConsentFormNotification(
            User recipient,
            String studentName,
            String vaccineName,
            String location,
            String scheduledDate);

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
