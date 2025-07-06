package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthCheckCampaignScheduledTasks {

    private final HealthCheckCampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final INotificationService notificationService;
    private final IHealthCheckFormService healthCheckFormService;
    private final IHealthCheckCampaignService healthCheckCampaignService;

    // Configuration properties for campaign auto-reject feature
    @Value("${healthcheck.campaign.auto-reject.enabled:true}")
    private boolean autoRejectEnabled;

    @Value("${healthcheck.campaign.reminder-hours:12}")
    private int reminderHours;

    @Value("${healthcheck.campaign.auto-reject-hours:24}")
    private int autoRejectHours;

    /**
     * Check for campaigns that have ended but are not marked as completed
     * Send reminder notifications to nurses if they haven't marked campaigns as completed within 12 hours after endDate
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 milliseconds)
    public void checkForIncompleteExpiredCampaigns() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime reminderThreshold = LocalDateTime.now().minusHours(reminderHours);
        
        // Find campaigns that ended yesterday but are still in IN_PROGRESS status
        List<HealthCheckCampaign> expiredCampaigns = campaignRepository.findByStatusAndEndDateBefore(
            CampaignStatus.IN_PROGRESS, 
            yesterday
        );
        
        for (HealthCheckCampaign campaign : expiredCampaigns) {
            // Check if the campaign ended more than 12 hours ago
            LocalDateTime campaignEndDateTime = campaign.getEndDate().atTime(23, 59, 59);
            
            if (campaignEndDateTime.isBefore(reminderThreshold)) {
                // Send reminder notification to the nurse
                notificationService.sendHealthCheckCampaignCompletionReminder(campaign);
                
                // Log the reminder for monitoring
                System.out.println("Sent completion reminder for health check campaign ID: " + 
                                 campaign.getId() + " - " + campaign.getName());
            }
        }
    }

    /**
     * Auto-decline health check forms that haven't been responded to within the deadline
     * This runs daily to check for forms that need to be auto-declined
     */
    @Scheduled(cron = "0 0 8 * * ?") // Run every day at 8:00 AM
    public void autoDeclineExpiredHealthCheckForms() {
        System.out.println("Starting auto-decline check for expired health check forms at: " + 
                         LocalDateTime.now());
        
        try {
            // Use the HealthCheckFormService to handle auto-decline logic
            healthCheckFormService.autoDeclineExpiredForms();
            
            System.out.println("Auto-decline check completed successfully at: " + 
                             LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Error during auto-decline check: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send reminder notifications for pending health check forms
     * This runs daily to remind parents about pending forms that are approaching their expiration deadlines
     */
    @Scheduled(cron = "0 0 9 * * ?") // Run every day at 9:00 AM
    public void sendHealthCheckFormReminders() {
        System.out.println("Starting health check form reminder notifications at: " + 
                         LocalDateTime.now());
        
        try {
            healthCheckFormService.sendReminderNotifications();
            
            System.out.println("Health check form reminder notifications completed at: " + 
                             LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Error sending health check form reminders: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Check for pending campaigns and send manager reminders or auto-reject them
     * Runs every hour to check for campaigns that need reminders (12 hours) or auto-rejection (24 hours)
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 milliseconds)
    @Transactional
    public void checkPendingCampaignsForReminderAndAutoReject() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find all campaigns that are still pending approval
        List<HealthCheckCampaign> pendingCampaigns = campaignRepository.findByStatus(CampaignStatus.PENDING);
        
        if (pendingCampaigns.isEmpty()) {
            return; // No pending campaigns to process
        }
        
        System.out.println("Checking " + pendingCampaigns.size() + " pending campaigns for reminders and auto-rejection at: " + now);
        
        // Get all managers for sending reminders
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");
        
        for (HealthCheckCampaign campaign : pendingCampaigns) {
            LocalDateTime createdAt = campaign.getCreatedAt();
            if (createdAt == null) {
                continue; // Skip campaigns without creation timestamp
            }
            
            long hoursElapsed = java.time.Duration.between(createdAt, now).toHours();
            
            try {
                // Check for auto-rejection first (24 hours)
                if (autoRejectEnabled && hoursElapsed >= autoRejectHours) {
                    autoRejectCampaign(campaign);
                }
                // Check for reminder (12 hours) if not auto-rejected
                else if (hoursElapsed >= reminderHours) {
                    sendManagerReminders(campaign, managers);
                }
            } catch (Exception e) {
                System.err.println("Error processing campaign ID " + campaign.getId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Completed checking pending campaigns at: " + now);
    }

    /**
     * Auto-reject a campaign that has been pending for too long
     */
    private void autoRejectCampaign(HealthCheckCampaign campaign) {
        try {
            System.out.println("Auto-rejecting campaign ID: " + campaign.getId() + " - " + campaign.getName());
            
            // Create a system user for auto-rejection (you might want to get an actual manager user)
            List<User> managers = userRepository.findByRole_RoleName("MANAGER");
            User systemManager = !managers.isEmpty() ? managers.get(0) : null;
            
            if (systemManager != null) {
                // Use the service to reject the campaign
                String autoRejectNotes = "Chiến dịch tự động bị từ chối do không nhận được phản hồi từ quản lý trong vòng " + 
                                       autoRejectHours + " giờ.";
                
                healthCheckCampaignService.rejectCampaignDTO(campaign.getId(), systemManager, autoRejectNotes);
                
                // Send notification to the campaign creator
                if (campaign.getCreatedBy() != null) {
                    notificationService.sendCampaignAutoRejectionNotification(campaign, campaign.getCreatedBy());
                }
                
                System.out.println("Successfully auto-rejected campaign ID: " + campaign.getId());
            } else {
                System.err.println("No manager found for auto-rejecting campaign ID: " + campaign.getId());
            }
        } catch (Exception e) {
            System.err.println("Error auto-rejecting campaign ID " + campaign.getId() + ": " + e.getMessage());
        }
    }

    /**
     * Send reminder notifications to managers about a pending campaign
     */
    private void sendManagerReminders(HealthCheckCampaign campaign, List<User> managers) {
        try {
            System.out.println("Sending manager reminders for campaign ID: " + campaign.getId() + " - " + campaign.getName());
            
            for (User manager : managers) {
                notificationService.sendManagerApprovalReminder(campaign, manager);
            }
            
            System.out.println("Successfully sent reminders to " + managers.size() + " managers for campaign ID: " + campaign.getId());
        } catch (Exception e) {
            System.err.println("Error sending manager reminders for campaign ID " + campaign.getId() + ": " + e.getMessage());
        }
    }
}
