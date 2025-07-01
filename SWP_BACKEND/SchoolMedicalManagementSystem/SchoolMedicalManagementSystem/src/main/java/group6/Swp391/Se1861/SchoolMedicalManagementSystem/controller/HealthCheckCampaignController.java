package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;

import java.util.*;
import java.util.Optional;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUserService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/health-check/campaigns")
@RequiredArgsConstructor
public class HealthCheckCampaignController {

    private final IHealthCheckCampaignService campaignService;
    private final IUserService userService;
    private final IStudentService studentService;
    private final StudentRepository studentRepository;

    @PostMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> createCampaign(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody HealthCheckCampaignDTO dto) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User nurse = userOptional.get();

        HealthCheckCampaign campaign = campaignService.createCampaign(
            dto.getName(),
            dto.getDescription(),
            dto.getStartDate(),
            dto.getEndDate(),
            dto.getLocation(),
            dto.getCategories(),
            nurse,
            dto.getMinAge(),
            dto.getMaxAge(),
            dto.getTargetClasses()
        );

        return ResponseEntity.ok(campaign);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> updateCampaign(@PathVariable Long id,
                                           @RequestBody HealthCheckCampaignDTO dto) {
        HealthCheckCampaign campaign = campaignService.updateCampaign(
            id,
            dto.getName(),
            dto.getDescription(),
            dto.getStartDate(),
            dto.getEndDate(),
            dto.getLocation(),
            dto.getCategories(),
            dto.getMinAge(),
            dto.getMaxAge(),
            dto.getTargetClasses()
        );

        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> submitForApproval(@PathVariable Long id) {
        HealthCheckCampaign campaign = campaignService.submitForApproval(id);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> approveCampaign(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User manager = userOptional.get();
        HealthCheckCampaign campaign = campaignService.approveCampaign(id, manager);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> rejectCampaign(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails,
                                           @RequestParam String notes) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User manager = userOptional.get();
        HealthCheckCampaign campaign = campaignService.rejectCampaign(id, manager, notes);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/schedule")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> scheduleCampaign(@PathVariable Long id,
                                             @RequestParam int targetCount) {
        HealthCheckCampaign campaign = campaignService.scheduleCampaign(id, targetCount);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> startCampaign(@PathVariable Long id) {
        HealthCheckCampaign campaign = campaignService.startCampaign(id);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> completeCampaign(@PathVariable Long id) {
        HealthCheckCampaign campaign = campaignService.completeCampaign(id);
        return ResponseEntity.ok(campaign);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> cancelCampaign(@PathVariable Long id,
                                           @RequestParam String notes) {
        HealthCheckCampaign campaign = campaignService.cancelCampaign(id, notes);
        return ResponseEntity.ok(campaign);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getCampaignById(@PathVariable Long id) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(id);
        return ResponseEntity.ok(campaign);
    }

    @GetMapping("/nurse")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> getCampaignsByNurse(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User nurse = userOptional.get();
        List<HealthCheckCampaign> campaigns = campaignService.getCampaignsByNurse(nurse);
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getCampaignsByStatus(@PathVariable String status) {
        CampaignStatus campaignStatus = CampaignStatus.valueOf(status.toUpperCase());
        List<HealthCheckCampaign> campaigns = campaignService.getCampaignsByStatus(campaignStatus);
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getUpcomingCampaigns() {
        List<HealthCheckCampaign> campaigns = campaignService.getUpcomingCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getCompletedCampaigns() {
        List<HealthCheckCampaign> campaigns = campaignService.getCompletedCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getActiveCampaignsByClass(@PathVariable String className) {
        List<HealthCheckCampaign> campaigns = campaignService.getActiveCampaignsByClass(className);
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getAvailableCategories() {
        return ResponseEntity.ok(HealthCheckCategory.values());
    }

    @GetMapping("/calculate-target-count")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> calculateTargetCount(@RequestParam(required = false) Integer minAge,
                                                 @RequestParam(required = false) Integer maxAge,
                                                 @RequestParam(required = false) List<String> targetClasses) {
        try {
            // Convert list to set for service method
            Set<String> classSet = targetClasses != null ? new HashSet<>(targetClasses) : new HashSet<>();
            
            int targetCount = campaignService.calculateTargetCount(minAge, maxAge, classSet);
            
            // Return a simple response with the count
            return ResponseEntity.ok(Map.of(
                "targetCount", targetCount,
                "minAge", minAge,
                "maxAge", maxAge,
                "targetClasses", classSet
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error calculating target count: " + e.getMessage(),
                "targetCount", 0
            ));
        }
    }

    @PostMapping("/{id}/send-notifications")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> sendNotificationsToParents(@PathVariable Long id) {
        try {
            Map<String, Object> result = campaignService.sendNotificationsToParents(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error sending notifications: " + e.getMessage(),
                "notificationsSent", 0
            ));
        }
    }

    @GetMapping("/parent/form/{formId}")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getCampaignByFormIdForParent(@PathVariable Long formId,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get the authenticated parent
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User parent = userOptional.get();

            // Get campaign information through the form service
            HealthCheckCampaign campaign = campaignService.getCampaignByFormIdForParent(formId, parent);
            
            return ResponseEntity.ok(campaign);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body("You are not authorized to view this campaign");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving campaign: " + e.getMessage());
        }
    }

    @GetMapping("/parent/active")
    @PreAuthorize("hasRole('PARENT')")  
    public ResponseEntity<?> getActiveCampaignsForParent(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get the authenticated parent
            Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User parent = userOptional.get();

            // Get all active campaigns for this parent's children
            List<HealthCheckCampaign> campaigns = campaignService.getActiveCampaignsForParent(parent);
            
            return ResponseEntity.ok(campaigns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving campaigns: " + e.getMessage());
        }
    }
}
