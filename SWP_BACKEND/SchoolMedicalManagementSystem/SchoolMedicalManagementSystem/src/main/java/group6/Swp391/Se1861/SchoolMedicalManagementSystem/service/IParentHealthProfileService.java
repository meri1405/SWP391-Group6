package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;

import java.util.List;

public interface IParentHealthProfileService {
    
    /**
     * Create a new health profile for a student
     */
    HealthProfileDTO createHealthProfile(Long parentId, HealthProfileDTO healthProfileDTO);

    /**
     * Get health profile by ID (parent access)
     */
    HealthProfileDTO getHealthProfileById(Long parentId, Long profileId);

    /**
     * Get health profile by student ID (single profile per student)
     */
    HealthProfileDTO getHealthProfileByStudentId(Long parentId, Long studentId);

    /**
     * Get approved health profile by student ID (single profile per student)
     */
    HealthProfileDTO getApprovedHealthProfileByStudentId(Long parentId, Long studentId);

    /**
     * Update health profile (parent can only update pending profiles)
     */
    HealthProfileDTO updateHealthProfile(Long parentId, Long profileId, HealthProfileDTO healthProfileDTO);

    /**
     * Delete health profile (parent can only delete pending profiles)
     */
    void deleteHealthProfile(Long parentId, Long profileId);

    /**
     * Check if parent can edit health profile
     */
    boolean canEditHealthProfile(Long parentId, Long profileId);

    /**
     * Check if parent can create new health profile for student
     */
    boolean canCreateNewHealthProfile(Long parentId, Long studentId);

    /**
     * Convert entity to DTO
     */
    HealthProfileDTO convertToDTO(group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile healthProfile);

    HealthProfileDTO convertToDetailedDTO(HealthProfile healthProfile);
}
