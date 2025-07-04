package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentHealthProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/parent/students")
@PreAuthorize("hasRole('PARENT')")  // Only parents can access these endpoints
public class ParentStudentHealthProfileController {

    @Autowired
    private IParentHealthProfileService parentHealthProfileService;

    /**
     * Get health profile by student ID
     * @param user authenticated parent user
     * @param studentId ID of the student
     * @return health profile for the student
     */
    @GetMapping("/{studentId}/health-profile")
    public ResponseEntity<HealthProfileDTO> getHealthProfileByStudentId(
            @AuthenticationPrincipal User user,
            @PathVariable Long studentId) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        HealthProfileDTO healthProfile = parentHealthProfileService.getHealthProfileByStudentId(user.getId(), studentId);
        return ResponseEntity.ok(healthProfile);
    }

    /**
     * Get approved health profile by student ID
     * @param user authenticated parent user
     * @param studentId ID of the student
     * @return approved health profile for the student
     */
    @GetMapping("/{studentId}/health-profile/approved")
    public ResponseEntity<HealthProfileDTO> getApprovedHealthProfileByStudentId(
            @AuthenticationPrincipal User user,
            @PathVariable Long studentId) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        HealthProfileDTO approvedHealthProfile = parentHealthProfileService.getApprovedHealthProfileByStudentId(user.getId(), studentId);
        return ResponseEntity.ok(approvedHealthProfile);
    }

    /**
     * Get health profile by student ID (backward compatibility - returns as list)
     * @param user authenticated parent user
     * @param studentId ID of the student
     * @return list containing single health profile for the student
     */
    @GetMapping("/{studentId}/health-profiles")
    public ResponseEntity<List<HealthProfileDTO>> getHealthProfilesByStudentId(
            @AuthenticationPrincipal User user,
            @PathVariable Long studentId) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        HealthProfileDTO healthProfile = parentHealthProfileService.getHealthProfileByStudentId(user.getId(), studentId);
        List<HealthProfileDTO> healthProfiles = healthProfile != null ? 
            Collections.singletonList(healthProfile) : Collections.emptyList();
        return ResponseEntity.ok(healthProfiles);
    }

    /**
     * Get approved health profile by student ID (backward compatibility - returns as list)
     * @param user authenticated parent user
     * @param studentId ID of the student
     * @return list containing single approved health profile for the student
     */
    @GetMapping("/{studentId}/health-profiles/approved")
    public ResponseEntity<List<HealthProfileDTO>> getApprovedHealthProfilesByStudentId(
            @AuthenticationPrincipal User user,
            @PathVariable Long studentId) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        HealthProfileDTO approvedHealthProfile = parentHealthProfileService.getApprovedHealthProfileByStudentId(user.getId(), studentId);
        List<HealthProfileDTO> approvedHealthProfiles = approvedHealthProfile != null ? 
            Collections.singletonList(approvedHealthProfile) : Collections.emptyList();
        return ResponseEntity.ok(approvedHealthProfiles);
    }
}
