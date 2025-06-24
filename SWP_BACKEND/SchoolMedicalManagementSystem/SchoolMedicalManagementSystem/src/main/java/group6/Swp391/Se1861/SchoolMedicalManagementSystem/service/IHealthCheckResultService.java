package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;

import java.time.LocalDate;
import java.util.List;

public interface IHealthCheckResultService {
    HealthCheckResult recordResult(Long formId, HealthCheckCategory category,
                                   double weight, double height, User nurse,
                                   boolean isAbnormal, String resultNotes,
                                   String recommendations, ResultStatus status);

    Long syncResultWithCategoryTable(HealthCheckCategory category,
                                     HealthCheckResult result,
                                     HealthProfile healthProfile);

    HealthCheckResult scheduleConsultation(Long resultId, LocalDate consultationDate,
                                           String consultationTime, String consultationLocation,
                                           boolean isOnline, String meetingLink, String meetingPassword);

    HealthCheckResult markAsNotified(Long resultId, boolean parent, boolean manager);

    HealthCheckResult markAsSynced(Long resultId);

    HealthCheckResult getResultById(Long id);

    List<HealthCheckResult> getResultsByForm(Long formId);

    List<HealthCheckResult> getResultsByStudent(Long studentId);

    List<HealthCheckResult> getResultsByHealthProfile(Long healthProfileId);

    List<HealthCheckResult> getResultsByCategory(HealthCheckCategory category);

    List<HealthCheckResult> getAbnormalResults();

    List<HealthCheckResult> getResultsByStatus(ResultStatus status);

    List<HealthCheckResult> getResultsRequiringConsultation();

    List<HealthCheckResult> getResultsByCampaign(Long campaignId);

    List<HealthCheckResult> getResultsByCampaignAndCategory(Long campaignId,
                                                            HealthCheckCategory category);

    int countAbnormalResultsByCampaign(Long campaignId);

    /**
     * Get all health check results for all children of a parent
     * @param parentId the ID of the parent user
     * @return list of health check results for all children of the parent
     */
    List<HealthCheckResult> getResultsForParentChildren(Long parentId);

    /**
     * Synchronizes a health check result with the student's health profile.
     * Updates the health profile with data from the health check result including
     * weight, height, BMI, and adds notes for abnormal results.
     *
     * @param resultId the ID of the health check result to synchronize
     * @return the updated health check result with syncedToProfile set to true
     */
    HealthCheckResult syncResultWithHealthProfile(Long resultId);
}
