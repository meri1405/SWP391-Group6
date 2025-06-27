package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/health-check/campaigns")
@RequiredArgsConstructor
public class HealthCheckCampaignController {

    private final IHealthCheckCampaignService campaignService;
    private final IUserService userService;

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
}
