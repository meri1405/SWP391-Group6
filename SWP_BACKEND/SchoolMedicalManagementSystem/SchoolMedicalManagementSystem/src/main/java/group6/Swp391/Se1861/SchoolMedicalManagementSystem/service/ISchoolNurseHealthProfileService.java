package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;

import java.util.List;

public interface ISchoolNurseHealthProfileService {
    
    /**
     * Get all health profiles (for school nurse dashboard)
     */
    List<HealthProfileDTO> getAllHealthProfiles();

    /**
     * Get health profiles by status
     */
    List<HealthProfileDTO> getHealthProfilesByStatus(ProfileStatus status);

    /**
     * Get health profile by ID
     */
    HealthProfileDTO getHealthProfileById(Long profileId);

    /**
     * Approve health profile
     */
    HealthProfileDTO approveHealthProfile(Long nurseId, Long profileId, String nurseNote);

    /**
     * Reject health profile
     */
    HealthProfileDTO rejectHealthProfile(Long nurseId, Long profileId, String nurseNote);

    /**
     * Get health profile statistics
     */
    HealthProfileDTO convertToBasicDTO(HealthProfile healthProfile);

    /**
     * Convert entity to DTO
     */
    HealthProfileDTO convertToDetailedDTO(HealthProfile healthProfile);
}
