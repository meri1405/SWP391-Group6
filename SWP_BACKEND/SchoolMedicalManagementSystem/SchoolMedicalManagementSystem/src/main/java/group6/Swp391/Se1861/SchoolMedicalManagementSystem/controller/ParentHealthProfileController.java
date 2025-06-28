package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRuleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentHealthProfileService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationRuleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/parent/health-profiles")
public class ParentHealthProfileController {

    @Autowired
    private IParentHealthProfileService parentHealthProfileService;

    @Autowired
    private IVaccinationRuleService vaccinationRuleService;

    /**
     * Create a new health profile for a child
     * @param user authenticated parent user
     * @param healthProfileDTO health profile data
     * @return created health profile
     */
    @PostMapping
    public ResponseEntity<HealthProfileDTO> createHealthProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody HealthProfileDTO healthProfileDTO) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can create health profiles");
        }

        HealthProfileDTO createdProfile = parentHealthProfileService.createHealthProfile(user.getId(), healthProfileDTO);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    /**
     * Get a health profile by ID
     * @param user authenticated parent user
     * @param profileId ID of the health profile
     * @return health profile data
     */
    @GetMapping("/{profileId}")
    public ResponseEntity<HealthProfileDTO> getHealthProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        HealthProfileDTO healthProfile = parentHealthProfileService.getHealthProfileById(user.getId(), profileId);
        return ResponseEntity.ok(healthProfile);
    }    /**
     * Update a health profile
     * @param user authenticated parent user
     * @param profileId ID of the health profile
     * @param healthProfileDTO updated health profile data
     * @return updated health profile
     */
    @PutMapping("/{profileId}")
    public ResponseEntity<HealthProfileDTO> updateHealthProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId,
            @Valid @RequestBody HealthProfileDTO healthProfileDTO) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can update health profiles");
        }

        HealthProfileDTO updatedProfile = parentHealthProfileService.updateHealthProfile(user.getId(), profileId, healthProfileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Delete a health profile
     * @param user authenticated parent user
     * @param profileId ID of the health profile
     * @return success response
     */
    @DeleteMapping("/{profileId}")
    public ResponseEntity<Void> deleteHealthProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long profileId) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can delete health profiles");
        }

        parentHealthProfileService.deleteHealthProfile(user.getId(), profileId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all vaccination rules for parents
     * @param user authenticated parent user
     * @return list of all vaccination rules
     */
    @GetMapping("/vaccination-rules")
    public ResponseEntity<List<VaccinationRuleDTO>> getVaccinationRules(
            @AuthenticationPrincipal User user) {

        // Verify user has PARENT role
        if (user == null || !user.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access vaccination rules");
        }

        List<VaccinationRuleDTO> rules = vaccinationRuleService.getAllVaccinationRules();
        return ResponseEntity.ok(rules);
    }
}
