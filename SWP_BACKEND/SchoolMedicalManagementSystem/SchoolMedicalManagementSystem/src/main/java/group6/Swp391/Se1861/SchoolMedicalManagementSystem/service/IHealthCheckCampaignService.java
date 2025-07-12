package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CreateHealthCheckCampaignRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RecordHealthCheckResultRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ScheduleHealthCheckCampaignRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.TimeSlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface IHealthCheckCampaignService {
    
    HealthCheckCampaignDTO createCampaign(User nurse, CreateHealthCheckCampaignRequest request);
    
    HealthCheckCampaignDTO getCampaignById(Long id);
    
    HealthCheckCampaign getCampaignModelById(Long id);
    
    Page<HealthCheckCampaignDTO> getCampaignsByNurse(User nurse, Pageable pageable);
    
    Page<HealthCheckCampaignDTO> getCampaignsByStatus(CampaignStatus status, Pageable pageable);
    
    HealthCheckCampaignDTO updateCampaign(Long id, User nurse, CreateHealthCheckCampaignRequest request);
    
    HealthCheckCampaignDTO approveCampaignDTO(Long id, User manager);
    
    HealthCheckCampaignDTO rejectCampaignDTO(Long id, User manager, String notes);
    
    HealthCheckCampaignDTO scheduleCampaignDTO(Long id, ScheduleHealthCheckCampaignRequest request);
    
    HealthCheckCampaign scheduleCampaign(Long id, Integer targetCount, TimeSlot timeSlot, String scheduleNotes);
    
    HealthCheckCampaignDTO startCampaignDTO(Long id);
    
    HealthCheckCampaignDTO completeCampaignDTO(Long id);
    
    List<StudentDTO> getEligibleStudents(HealthCheckCampaign campaign);
    
    List<StudentDTO> getEligibleStudents(Long campaignId);
    
    List<Map<String, Object>> getEligibleStudentsWithFormStatus(Long campaignId);
    
    Map<String, Object> generateHealthCheckForms(Long campaignId);
    
    Map<String, Object> sendNotificationsToParents(Long campaignId);
    
    Map<String, Object> sendNotificationsToParents(Long campaignId, String customMessage);
    
    void sendFormsToEligibleParents(HealthCheckCampaign campaign);
    
    HealthCheckCampaignDTO convertToDTO(HealthCheckCampaign campaign);
    
    void recordHealthCheckResult(RecordHealthCheckResultRequest request);
    
    List<Map<String, Object>> getConfirmedStudents(Long campaignId);
    
    List<Map<String, Object>> getCampaignResults(Long campaignId);
    
    int calculateTargetCount(Integer minAge, Integer maxAge, Set<String> targetClasses);
    
    /**
     * Send health check result notifications to parents after campaign completion
     * 
     * @param campaignId The campaign ID
     * @param studentIds The list of student IDs to send notifications for (if null or empty, send to all confirmed students)
     * @param notificationContent The custom notification content (HTML format supported)
     * @param useDefaultTemplate Whether to use auto-generated default template instead of custom content
     * @return The number of notifications sent
     */
    int sendHealthCheckResultNotificationsToParents(Long campaignId, List<Long> studentIds, String notificationContent, boolean useDefaultTemplate);
    
    /**
     * Get health check campaigns count by month and year
     * 
     * @param year The year to filter by
     * @param month The month to filter by (1-12)
     * @return The count of campaigns created in the specified month
     */
    long getCampaignsCountByMonth(int year, int month);
}
