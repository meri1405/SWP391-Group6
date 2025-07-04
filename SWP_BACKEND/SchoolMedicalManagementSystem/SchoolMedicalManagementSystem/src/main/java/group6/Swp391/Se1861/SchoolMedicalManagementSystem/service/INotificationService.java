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
     * NOTIFICATION FOR UPDATE HEALTH PROFILE
     * */

    NotificationDTO createHealthProfileUpdateNotification(
            HealthProfile healthProfile,
            User recipient,
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
     * Create campaign completion notification
     */
    NotificationDTO createCampaignCompletionNotification(
            User recipient,
            VaccinationCampaign campaign,
            User completedBy);

    /**
     * Create vaccination consent form notification
     */
    NotificationDTO createVaccinationConsentFormNotification(
            User recipient,
            String studentName,
            String vaccineName,
            String location,
            String scheduledDate,
            VaccinationForm vaccinationForm);


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
    
    /**
     * Notify managers about a new restock request
     */
    void notifyManagersAboutRestockRequest(RestockRequest restockRequest);
    
    /**
     * Notify nurse about restock request approval
     */
    void notifyNurseAboutRestockRequestApproval(RestockRequest restockRequest);
    /**
     * Send health check campaign invitation to parents (with customizable content)
     */
    NotificationDTO sendHealthCheckCampaignInvitationToParent(
            User parent,
            HealthCheckCampaign campaign,
            String studentName,
            String customMessage,
            HealthCheckForm healthCheckForm);
    
    /**
     * Send health check campaign parent confirmation/decline notification
     */
    void sendHealthCheckCampaignParentConfirmation(
            HealthCheckCampaign campaign,
            User parent,
            Student student,
            String message);
    
    /**
     * Send health check form confirmation/decline notification with form reference
     * Also notifies the school nurse about parent's response
     */
    void sendHealthCheckFormConfirmation(
            HealthCheckForm form,
            User parent,
            Student student,
            String message,
            boolean isConfirmed);
    
    /**
     * Send health check campaign parent invitation
     */
    void sendHealthCheckCampaignParentInvitation(
            HealthCheckCampaign campaign,
            User parent,
            Student student,
            String message,
            HealthCheckForm form);
    
    /**
     * Send health check appointment details to parent
     */
    NotificationDTO sendHealthCheckAppointmentToParent(
            User parent,
            String studentName,
            String appointmentDate,
            String appointmentTime,
            String location,
            int queueNumber,
            HealthCheckCampaign campaign);

    void notifyNurseAboutRestockRequestRejection(RestockRequest restockRequest, String notes);

    /**
     * Create abnormal health check result notification
     */
    
    /**
     * HEALTH CHECK CAMPAIGN NOTIFICATIONS
     */
    
    /**
     * Notify managers about new health check campaign pending approval
     */
    void notifyManagersAboutHealthCheckCampaignApproval(HealthCheckCampaign campaign, int estimatedStudentCount);
    
    /**
     * Notify nurse about health check campaign approval
     */
    void notifyNurseAboutHealthCheckCampaignApproval(HealthCheckCampaign campaign, User approver);
    
    /**
     * Notify nurse about health check campaign rejection
     */
    void notifyNurseAboutHealthCheckCampaignRejection(HealthCheckCampaign campaign, User rejector, String reason);
    
    /**
     * Notify manager about health check campaign scheduling
     */
    void notifyManagerAboutHealthCheckCampaignScheduling(HealthCheckCampaign campaign, int scheduledStudentCount);
    
    /**
     * Notify manager about health check campaign completion
     */
    void notifyManagerAboutHealthCheckCampaignCompletion(HealthCheckCampaign campaign, int completedStudentCount);
    
    /**
     * Send abnormal health check result notification to parent
     */
    NotificationDTO sendAbnormalHealthCheckResultToParent(
            User parent,
            String studentName,
            String abnormalFindings,
            String recommendations,
            HealthCheckCampaign campaign);
    
    /**
     * Send completion reminder to nurse
     */
    void sendHealthCheckCampaignCompletionReminder(HealthCheckCampaign campaign);
    
    /**
     * CAMPAIGN COMPLETION REQUEST NOTIFICATIONS
     */
    
    /**
     * Notify managers about a new campaign completion request
     */
    void notifyManagersAboutCampaignCompletionRequest(CampaignCompletionRequest request);
    
    /**
     * Notify nurse about campaign completion request approval
     */
    void notifyNurseAboutCampaignCompletionApproval(CampaignCompletionRequest request, User manager);
    
    /**
     * Notify nurse about campaign completion request rejection
     */
    void notifyNurseAboutCampaignCompletionRejection(CampaignCompletionRequest request, User manager);
    /**
     * Notify nurse about health check campaign scheduling
     */
    void notifyNurseAboutHealthCheckCampaignScheduling(HealthCheckCampaign campaign);
    
    /**
     * Send health check schedule notification to parents
     */
    void notifyParentsAboutHealthCheckSchedule(HealthCheckCampaign campaign);

    /**
     * Send a reminder to managers about a pending health check campaign that needs approval
     * This is sent when a campaign has been pending for 12 hours
     * @param campaign The pending campaign
     * @param manager The manager to send the reminder to
     */
    void sendManagerApprovalReminder(HealthCheckCampaign campaign, User manager);

    /**
     * Send auto-rejection notification when a campaign is automatically rejected
     * This is sent when a campaign has been pending for 24 hours without manager response
     * @param campaign The campaign that was auto-rejected
     * @param creator The creator of the campaign to notify
     */
    void sendCampaignAutoRejectionNotification(HealthCheckCampaign campaign, User creator);
}
