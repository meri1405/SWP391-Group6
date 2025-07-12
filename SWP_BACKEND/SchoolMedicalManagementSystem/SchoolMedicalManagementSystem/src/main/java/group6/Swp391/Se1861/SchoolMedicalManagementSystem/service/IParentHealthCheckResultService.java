package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultSummaryDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultDetailDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.util.List;

/**
 * Service interface for parent health check result operations
 * Handles retrieving health check results for parents
 */
public interface IParentHealthCheckResultService {

    /**
     * Get all health check results summary for a parent's children
     * @param parent The authenticated parent user
     * @return List of health check result summaries for all children
     */
    List<HealthCheckResultSummaryDTO> getAllHealthCheckResultsForParent(User parent);

    /**
     * Get detailed health check result by result ID
     * @param resultId The health check result ID
     * @param parent The authenticated parent user
     * @return Detailed health check result
     */
    HealthCheckResultDetailDTO getHealthCheckResultDetail(Long resultId, User parent);
}
