package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;

import java.util.List;

/**
 * Service interface for managing parent accounts
 * Only Admin should have access to these operations
 * Admin can only manage account status, not create/edit parent information
 */
public interface IParentService {
    
    /**
     * Get all parents in the system
     * @return List of all parents
     */
    List<ParentDTO> getAllParents();
    
    /**
     * Get parent by ID
     * @param parentId the parent ID
     * @return the parent DTO
     * @throws IllegalArgumentException if parent not found
     */
    ParentDTO getParentById(Long parentId);
    
    /**
     * Update parent account status (enabled/disabled)
     * @param parentId the parent ID
     * @param enabled new status
     * @throws IllegalArgumentException if parent not found
     */
    void updateParentStatus(Long parentId, Boolean enabled);
    
    /**
     * Get children of a parent
     * @param parentId the parent ID
     * @return list of children (students)
     * @throws IllegalArgumentException if parent not found
     */
    List<Object> getParentChildren(Long parentId);
}
