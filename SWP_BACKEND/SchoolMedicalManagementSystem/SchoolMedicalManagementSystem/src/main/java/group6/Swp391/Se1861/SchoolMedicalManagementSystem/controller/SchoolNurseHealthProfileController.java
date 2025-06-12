package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SchoolNurseHealthProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurse/health-profiles")
public class SchoolNurseHealthProfileController {

    @Autowired
    private SchoolNurseHealthProfileService schoolNurseHealthProfileService;

    /**
     * Get health profiles by status
     * @param user authenticated school nurse user
     * @param status filter status (PENDING, APPROVED, REJECTED)
     * @return list of health profiles
     */
    @GetMapping
    public ResponseEntity<List<HealthProfileDTO>> getHealthProfiles(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) ProfileStatus status) {

        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can access health profiles");
        }

        List<HealthProfileDTO> profiles;
        if (status != null) {
            profiles = schoolNurseHealthProfileService.getHealthProfilesByStatus(status);
        } else {
            profiles = schoolNurseHealthProfileService.getAllHealthProfiles();
        }
        return ResponseEntity.ok(profiles);
    }

    /**
     * Get a health profile by ID
     * @param user authenticated school nurse user
     * @param profileId ID of the health profile
     * @return health profile data
     */
    @GetMapping("/{profileId}")
    public ResponseEntity<HealthProfileDTO> getHealthProfileDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId) {

        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can access health profiles");
        }

        HealthProfileDTO healthProfile = schoolNurseHealthProfileService.getHealthProfileById(profileId);
        return ResponseEntity.ok(healthProfile);
    }

    /**
     * Update a health profile
     * @param user authenticated school nurse user
     * @param profileId ID of the health profile
     * @param healthProfileDTO updated health profile data
     * @return updated health profile
     */
    @PutMapping("/{profileId}")
    public ResponseEntity<HealthProfileDTO> updateHealthProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId,
            @Valid @RequestBody HealthProfileDTO healthProfileDTO) {

        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can update health profiles");
        }

        HealthProfileDTO updatedProfile = schoolNurseHealthProfileService.updateHealthProfile(user.getId(), profileId, healthProfileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Approve a health profile
     * @param user authenticated school nurse user
     * @param profileId ID of the health profile
     * @param requestBody contains optional nurse notes
     * @return approved health profile
     */
    @PutMapping("/{profileId}/approve")
    public ResponseEntity<HealthProfileDTO> approveHealthProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId,
            @RequestBody(required = false) Map<String, String> requestBody) {

        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can approve health profiles");
        }

        String nurseNote = requestBody != null ? requestBody.get("nurseNote") : null;
        HealthProfileDTO approvedProfile = schoolNurseHealthProfileService.approveHealthProfile(user.getId(), profileId, nurseNote);
        return ResponseEntity.ok(approvedProfile);
    }

    /**
     * Reject a health profile
     * @param user authenticated school nurse user
     * @param profileId ID of the health profile
     * @param requestBody contains the nurse note for rejection
     * @return rejected health profile
     */
    @PutMapping("/{profileId}/reject")
    public ResponseEntity<HealthProfileDTO> rejectHealthProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId,
            @RequestBody Map<String, String> requestBody) {

        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can reject health profiles");
        }

        // Chấp nhận cả reason và nurseNote để đảm bảo tương thích
        String rejectionReason = null;
        
        // Kiểm tra nurseNote trước (ưu tiên)
        if (requestBody != null && requestBody.containsKey("nurseNote") && !requestBody.get("nurseNote").trim().isEmpty()) {
            rejectionReason = requestBody.get("nurseNote");
        } 
        // Nếu không có nurseNote, kiểm tra reason
        else if (requestBody != null && requestBody.containsKey("reason") && !requestBody.get("reason").trim().isEmpty()) {
            rejectionReason = requestBody.get("reason");
        }
        
        // Nếu không có cả hai, báo lỗi
        if (rejectionReason == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        HealthProfileDTO rejectedProfile = schoolNurseHealthProfileService.rejectHealthProfile(user.getId(), profileId, rejectionReason);
        return ResponseEntity.ok(rejectedProfile);
    }

    /**
     * Test endpoint for authentication 
     * @param user authenticated user
     * @return success message
     */
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testAuth(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "authenticated", false,
                "message", "Not authenticated"
            ));
        }
        
        return ResponseEntity.ok(Map.of(
            "authenticated", true,
            "userId", user.getId(),
            "username", user.getUsername(),
            "role", user.getRole().getRoleName(),
            "message", "Authentication successful"
        ));
    }
} 