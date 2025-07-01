package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public interface IHealthCheckCampaignService {
    HealthCheckCampaign createCampaign(String name, String description, LocalDate startDate,
                                       LocalDate endDate, String location, Set<HealthCheckCategory> categories,
                                       User nurse, Integer minAge, Integer maxAge, Set<String> targetClasses);

    HealthCheckCampaign updateCampaign(Long id, String name, String description, LocalDate startDate,
                                       LocalDate endDate, String location, Set<HealthCheckCategory> categories,
                                       Integer minAge, Integer maxAge, Set<String> targetClasses);

    HealthCheckCampaign submitForApproval(Long id);

    HealthCheckCampaign approveCampaign(Long id, User manager);

    HealthCheckCampaign rejectCampaign(Long id, User manager, String notes);

    HealthCheckCampaign scheduleCampaign(Long id, int targetCount);

    HealthCheckCampaign startCampaign(Long id);

    HealthCheckCampaign completeCampaign(Long id);

    HealthCheckCampaign cancelCampaign(Long id, String notes);

    HealthCheckCampaign getCampaignById(Long id);

    List<HealthCheckCampaign> getCampaignsByNurse(User nurse);

    List<HealthCheckCampaign> getCampaignsByStatus(CampaignStatus status);

    List<HealthCheckCampaign> getUpcomingCampaigns();

    List<HealthCheckCampaign> getCompletedCampaigns();

    List<HealthCheckCampaign> getActiveCampaignsByClass(String className);

    List<HealthCheckCampaign> getAllCampaigns();

    /**
     * Calculate target count based on criteria without creating a campaign
     */
    int calculateTargetCount(Integer minAge, Integer maxAge, Set<String> targetClasses);

    /**
     * Schedule campaign with target count (this will send notification to manager)
     */
    
    /**
     * Update target count without sending notification (for internal use when generating forms)
     */
    HealthCheckCampaign updateTargetCount(Long id, int targetCount);

    /**
     * Send notifications to parents of eligible students for a health check campaign
     */
    java.util.Map<String, Object> sendNotificationsToParents(Long campaignId);
}
