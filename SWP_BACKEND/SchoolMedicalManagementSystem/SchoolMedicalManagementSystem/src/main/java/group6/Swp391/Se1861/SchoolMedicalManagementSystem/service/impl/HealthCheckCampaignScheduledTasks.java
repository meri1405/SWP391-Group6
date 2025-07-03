package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthCheckCampaignScheduledTasks {

    private final HealthCheckCampaignRepository campaignRepository;
    private final INotificationService notificationService;
    private final IHealthCheckFormService healthCheckFormService;

    /**
     * Check for campaigns that have ended but are not marked as completed
     * Send reminder notifications to nurses if they haven't marked campaigns as completed within 12 hours after endDate
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 milliseconds)
    public void checkForIncompleteExpiredCampaigns() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime reminderThreshold = LocalDateTime.now().minusHours(12);
        
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
     * This runs daily to remind parents about pending forms
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
}
