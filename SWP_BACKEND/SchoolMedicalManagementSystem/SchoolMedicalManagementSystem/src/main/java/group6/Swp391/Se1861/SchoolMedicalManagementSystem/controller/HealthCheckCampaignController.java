package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/nurse/health-check-campaigns")
@RequiredArgsConstructor
public class HealthCheckCampaignController {

    private final IHealthCheckCampaignService campaignService;
    private final IHealthCheckFormService healthCheckFormService;

    /**
     * Create a new health check campaign
     */
    @PostMapping
    public ResponseEntity<HealthCheckCampaignDTO> createCampaign(
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateHealthCheckCampaignRequest request) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.createCampaign(nurse, request);
            return new ResponseEntity<>(campaign, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all campaigns created by the authenticated nurse
     */
    @GetMapping("/my-campaigns")
    public ResponseEntity<Page<HealthCheckCampaignDTO>> getMyCampaigns(
            @AuthenticationPrincipal User nurse,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HealthCheckCampaignDTO> campaigns = campaignService.getCampaignsByNurse(nurse, pageable);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get campaign by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HealthCheckCampaignDTO> getCampaignById(@PathVariable Long id) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.getCampaignById(id);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Update a campaign (only if status is PENDING)
     */
    @PutMapping("/{id}")
    public ResponseEntity<HealthCheckCampaignDTO> updateCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateHealthCheckCampaignRequest request) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.updateCampaign(id, nurse, request);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }
    }

    /**
     * Start a campaign (change status to IN_PROGRESS and send forms to parents)
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<HealthCheckCampaignDTO> startCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.startCampaignDTO(id);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Complete a campaign
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<HealthCheckCampaignDTO> completeCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.completeCampaignDTO(id);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get eligible students for a campaign
     */
    @GetMapping("/{id}/eligible-students")
    public ResponseEntity<List<StudentDTO>> getEligibleStudents(@PathVariable Long id) {
        try {
            List<StudentDTO> students = campaignService.getEligibleStudents(id);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get eligible students with form status for a campaign
     */
    @GetMapping("/{id}/eligible-students-with-status")
    public ResponseEntity<List<Map<String, Object>>> getEligibleStudentsWithFormStatus(@PathVariable Long id) {
        try {
            List<Map<String, Object>> students = campaignService.getEligibleStudentsWithFormStatus(id);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Calculate target count for a health check campaign based on criteria
     */
    @PostMapping("/calculate-target-count")
    public ResponseEntity<Map<String, Integer>> calculateTargetCount(
            @RequestBody Map<String, Object> request) {
        try {
            Integer minAge = (Integer) request.get("minAge");
            Integer maxAge = (Integer) request.get("maxAge");
            @SuppressWarnings("unchecked")
            Set<String> targetClasses = new HashSet<>((List<String>) request.getOrDefault("targetClasses", new ArrayList<>()));
            
            int targetCount = campaignService.calculateTargetCount(minAge, maxAge, targetClasses);
            
            Map<String, Integer> response = new HashMap<>();
            response.put("targetCount", targetCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Integer> errorResponse = new HashMap<>();
            errorResponse.put("targetCount", 0);
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Generate health check forms for eligible students
     */
    @PostMapping("/{id}/generate-forms")
    public ResponseEntity<Map<String, Object>> generateForms(@PathVariable Long id) {
        try {
            Map<String, Object> response = campaignService.generateHealthCheckForms(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("formsGenerated", 0);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Send notifications to parents for health check campaign
     */
    @PostMapping("/{id}/send-notifications")
    public ResponseEntity<Map<String, Object>> sendNotificationsToParents(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String customMessage = null;
            if (requestBody != null && requestBody.containsKey("message")) {
                customMessage = requestBody.get("message");
            }
            Map<String, Object> response = campaignService.sendNotificationsToParents(id, customMessage);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("notificationsSent", 0);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get all health check forms for a specific campaign
     */
    @GetMapping("/{id}/forms")
    public ResponseEntity<List<HealthCheckFormDTO>> getFormsByCampaign(@PathVariable Long id) {
        try {
            // Get the campaign first
            HealthCheckCampaignDTO campaignDTO = campaignService.getCampaignById(id);
            if (campaignDTO == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Convert DTO to entity for service call
            HealthCheckCampaign campaign = new HealthCheckCampaign();
            campaign.setId(campaignDTO.getId());
            campaign.setName(campaignDTO.getName());
            
            List<HealthCheckFormDTO> forms = healthCheckFormService.getFormsByCampaign(campaign);
            return ResponseEntity.ok(forms);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

/**
 * Manager controller for health check campaigns
 */
@RestController
@RequestMapping("/api/manager/health-check-campaigns")
@RequiredArgsConstructor
class HealthCheckCampaignManagerController {

    private final IHealthCheckCampaignService campaignService;

    /**
     * Get campaigns by status for manager review
     */
    @GetMapping
    public ResponseEntity<Page<HealthCheckCampaignDTO>> getCampaignsByStatus(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            CampaignStatus campaignStatus = CampaignStatus.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<HealthCheckCampaignDTO> campaigns = campaignService.getCampaignsByStatus(campaignStatus, pageable);
            return ResponseEntity.ok(campaigns);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Approve a campaign
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<HealthCheckCampaignDTO> approveCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.approveCampaignDTO(id, manager);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Reject a campaign
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<HealthCheckCampaignDTO> rejectCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager,
            @RequestBody Map<String, String> requestBody) {
        try {
            String notes = requestBody.get("notes");
            HealthCheckCampaignDTO campaign = campaignService.rejectCampaignDTO(id, manager, notes);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Schedule a campaign with target count
     */
    @PostMapping("/{id}/schedule")
    public ResponseEntity<HealthCheckCampaignDTO> scheduleCampaign(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> requestBody) {
        try {
            Integer targetCount = requestBody.get("targetCount");
            if (targetCount == null || targetCount <= 0) {
                return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
            }
            HealthCheckCampaignDTO campaign = campaignService.scheduleCampaignDTO(id, targetCount);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
}
