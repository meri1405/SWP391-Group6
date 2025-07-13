package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/vaccination-campaigns")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagerVaccinationController {

    private final IVaccinationCampaignService campaignService;

    /**
     * Get pending campaigns for approval
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<VaccinationCampaignDTO>> getPendingCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VaccinationCampaignDTO> campaigns = campaignService.getCampaignsByStatus(
                VaccinationCampaign.CampaignStatus.PENDING, pageable);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get all campaigns by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<VaccinationCampaignDTO>> getCampaignsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            VaccinationCampaign.CampaignStatus campaignStatus = 
                    VaccinationCampaign.CampaignStatus.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<VaccinationCampaignDTO> campaigns = campaignService.getCampaignsByStatus(campaignStatus, pageable);
            return ResponseEntity.ok(campaigns);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get campaign details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VaccinationCampaignDTO> getCampaignById(@PathVariable Long id) {
        try {
            VaccinationCampaignDTO campaign = campaignService.getCampaignById(id);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Approve a vaccination campaign
     * Business rule: Manager has 24 hours from campaign creation to approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get campaign to check timing
            VaccinationCampaignDTO campaign = campaignService.getCampaignById(id);
            
            // Validate 24-hour approval window
            LocalDateTime createdAt = campaign.getCreatedDate();
            LocalDateTime now = LocalDateTime.now();
            long hoursElapsed = ChronoUnit.HOURS.between(createdAt, now);
            
            if (hoursElapsed > 24) {
                response.put("success", false);
                response.put("message", "Approval deadline exceeded. Campaigns must be approved within 24 hours of creation.");
                response.put("hoursElapsed", hoursElapsed);
                response.put("maxHours", 24);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            VaccinationCampaignDTO approvedCampaign = campaignService.approveCampaign(id, manager);
            response.put("success", true);
            response.put("message", "Campaign approved successfully");
            response.put("campaign", approvedCampaign);
            response.put("hoursElapsed", hoursElapsed);
            response.put("remainingHours", 24 - hoursElapsed);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Reject a vaccination campaign
     * Business rule: Manager has 24 hours from campaign creation to reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Rejection reason is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            // Get campaign to check timing
            VaccinationCampaignDTO campaign = campaignService.getCampaignById(id);
            
            // Validate 24-hour rejection window
            LocalDateTime createdAt = campaign.getCreatedDate();
            LocalDateTime now = LocalDateTime.now();
            long hoursElapsed = ChronoUnit.HOURS.between(createdAt, now);
            
            if (hoursElapsed > 24) {
                response.put("success", false);
                response.put("message", "Rejection deadline exceeded. Campaigns must be rejected within 24 hours of creation.");
                response.put("hoursElapsed", hoursElapsed);
                response.put("maxHours", 24);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            VaccinationCampaignDTO rejectedCampaign = campaignService.rejectCampaign(id, manager, reason);
            response.put("success", true);
            response.put("message", "Campaign rejected successfully");
            response.put("campaign", rejectedCampaign);
            response.put("hoursElapsed", hoursElapsed);
            response.put("remainingHours", 24 - hoursElapsed);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Complete a vaccination campaign
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            VaccinationCampaignDTO campaign = campaignService.completeCampaign(id, manager);
            response.put("success", true);
            response.put("message", "Campaign completed successfully");
            response.put("campaign", campaign);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get campaign statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getCampaignStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get counts for each status
            Page<VaccinationCampaignDTO> pending = campaignService.getCampaignsByStatus(
                    VaccinationCampaign.CampaignStatus.PENDING, PageRequest.of(0, Integer.MAX_VALUE));
            Page<VaccinationCampaignDTO> approved = campaignService.getCampaignsByStatus(
                    VaccinationCampaign.CampaignStatus.APPROVED, PageRequest.of(0, Integer.MAX_VALUE));
            Page<VaccinationCampaignDTO> rejected = campaignService.getCampaignsByStatus(
                    VaccinationCampaign.CampaignStatus.REJECTED, PageRequest.of(0, Integer.MAX_VALUE));
            Page<VaccinationCampaignDTO> completed = campaignService.getCampaignsByStatus(
                    VaccinationCampaign.CampaignStatus.COMPLETED, PageRequest.of(0, Integer.MAX_VALUE));
            Page<VaccinationCampaignDTO> inProgress = campaignService.getCampaignsByStatus(
                    VaccinationCampaign.CampaignStatus.IN_PROGRESS, PageRequest.of(0, Integer.MAX_VALUE));
            
            stats.put("pending", pending.getTotalElements());
            stats.put("approved", approved.getTotalElements());
            stats.put("rejected", rejected.getTotalElements());
            stats.put("completed", completed.getTotalElements());
            stats.put("inProgress", inProgress.getTotalElements());
            stats.put("total", pending.getTotalElements() + approved.getTotalElements() + 
                     rejected.getTotalElements() + completed.getTotalElements() + inProgress.getTotalElements());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error retrieving statistics: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check time constraints for campaign actions
     */
    @GetMapping("/{id}/time-status")
    public ResponseEntity<Map<String, Object>> getCampaignTimeStatus(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            VaccinationCampaignDTO campaign = campaignService.getCampaignById(id);
            LocalDateTime createdAt = campaign.getCreatedDate();
            LocalDateTime now = LocalDateTime.now();
            long hoursElapsed = ChronoUnit.HOURS.between(createdAt, now);
            
            response.put("success", true);
            response.put("campaignId", id);
            response.put("createdAt", createdAt);
            response.put("currentTime", now);
            response.put("hoursElapsed", hoursElapsed);
            response.put("remainingHours", Math.max(0, 24 - hoursElapsed));
            response.put("canApproveOrReject", hoursElapsed <= 24);
            response.put("status", campaign.getStatus());
            
            if (hoursElapsed > 24) {
                response.put("message", "24-hour deadline for approval/rejection has passed");
            } else {
                response.put("message", String.format("%.1f hours remaining for approval/rejection", (24.0 - hoursElapsed)));
            }
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Campaign not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
