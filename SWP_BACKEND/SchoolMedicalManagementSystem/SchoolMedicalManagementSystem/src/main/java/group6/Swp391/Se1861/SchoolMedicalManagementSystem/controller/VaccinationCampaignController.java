package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationCampaignService;
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

@RestController
@RequestMapping("/api/nurse/vaccination-campaigns")
@RequiredArgsConstructor
public class VaccinationCampaignController {

    private final IVaccinationCampaignService campaignService;

    /**
     * Create a new vaccination campaign
     */
    @PostMapping
    public ResponseEntity<?> createCampaign(
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateVaccinationCampaignRequest request) {
        try {
            System.out.println("Creating vaccination campaign with request: " + request);
            System.out.println("User: " + (nurse != null ? nurse.getUsername() : "null"));
            VaccinationCampaignDTO campaign = campaignService.createCampaign(nurse, request);
            return new ResponseEntity<>(campaign, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Error creating vaccination campaign: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Failed to create vaccination campaign: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Unexpected error creating vaccination campaign: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all campaigns created by the authenticated nurse
     */
    @GetMapping("/my-campaigns")
    public ResponseEntity<Page<VaccinationCampaignDTO>> getMyCampaigns(
            @AuthenticationPrincipal User nurse,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VaccinationCampaignDTO> campaigns = campaignService.getCampaignsByNurse(nurse, pageable);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get campaign by ID
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
     * Update a campaign (only if status is PENDING)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateVaccinationCampaignRequest request) {
        try {
            System.out.println("Updating vaccination campaign " + id + " with request: " + request);
            VaccinationCampaignDTO campaign = campaignService.updateCampaign(id, nurse, request);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            System.err.println("Error updating vaccination campaign: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Failed to update vaccination campaign: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Delete a campaign (only if status is PENDING)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            campaignService.deleteCampaign(id, nurse);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get eligible students for a campaign
     */
    @GetMapping("/{id}/eligible-students")
    public ResponseEntity<Object> getEligibleStudents(@PathVariable Long id) {
        try {
            System.out.println("Fetching eligible students for campaign ID: " + id);
            EligibleStudentsResponse response = campaignService.getEligibleStudents(id);
            System.out.println("Successfully found " + (response.getEligibleStudents() != null ? response.getEligibleStudents().size() : 0) + " eligible students");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("Error fetching eligible students for campaign " + id + ": " + e.getMessage());
            e.printStackTrace();
            String errorMessage = e.getMessage();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", errorMessage);
            errorResponse.put("message", "Failed to fetch eligible students: " + errorMessage);
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Unexpected error fetching eligible students for campaign " + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get count of eligible students for a vaccination rule
     */
    @GetMapping("/rules/{ruleId}/eligible-count")
    public ResponseEntity<Map<String, Object>> getEligibleStudentsCountByRule(@PathVariable Long ruleId) {
        try {
            int eligibleCount = campaignService.getEligibleStudentsCountByRule(ruleId);
            Map<String, Object> response = new HashMap<>();
            response.put("eligibleCount", eligibleCount);
            response.put("message", "Found " + eligibleCount + " eligible students for this vaccination rule");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("eligibleCount", 0);
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Generate vaccination forms for eligible students
     */
    @PostMapping("/{id}/generate-forms")
    public ResponseEntity<List<VaccinationFormDTO>> generateForms(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            List<VaccinationFormDTO> forms = campaignService.generateVaccinationForms(id, nurse);
            return ResponseEntity.ok(forms);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Send forms to parents
     */
    @PostMapping("/{id}/send-forms")
    public ResponseEntity<List<VaccinationFormDTO>> sendFormsToParents(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            List<VaccinationFormDTO> forms = campaignService.sendFormsToParents(id, nurse);
            return ResponseEntity.ok(forms);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all forms for a campaign
     */
    @GetMapping("/{id}/forms")
    public ResponseEntity<List<VaccinationFormDTO>> getCampaignForms(@PathVariable Long id) {
        try {
            List<VaccinationFormDTO> forms = campaignService.getCampaignForms(id);
            return ResponseEntity.ok(forms);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get confirmed forms for a campaign
     */
    @GetMapping("/{id}/forms/confirmed")
    public ResponseEntity<List<VaccinationFormDTO>> getConfirmedForms(@PathVariable Long id) {
        try {
            List<VaccinationFormDTO> forms = campaignService.getConfirmedForms(id);
            return ResponseEntity.ok(forms);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get pending forms for a campaign
     */
    @GetMapping("/{id}/forms/pending")
    public ResponseEntity<List<VaccinationFormDTO>> getPendingForms(@PathVariable Long id) {
        try {
            List<VaccinationFormDTO> forms = campaignService.getPendingForms(id);
            return ResponseEntity.ok(forms);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get vaccination records for a campaign
     */
    @GetMapping("/{id}/records")
    public ResponseEntity<List<VaccinationRecordDTO>> getCampaignRecords(@PathVariable Long id) {
        try {
            List<VaccinationRecordDTO> records = campaignService.getCampaignRecords(id);
            return ResponseEntity.ok(records);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Create vaccination record from confirmed form
     */
    @PostMapping("/forms/{formId}/records")
    public ResponseEntity<VaccinationRecordDTO> createVaccinationRecord(
            @PathVariable Long formId,
            @AuthenticationPrincipal User nurse,
            @RequestBody VaccinationRecordDTO recordDTO) {
        try {
            VaccinationRecordDTO record = campaignService.createVaccinationRecord(formId, recordDTO, nurse);
            return new ResponseEntity<>(record, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Update vaccination record (for post-vaccination monitoring)
     */
    @PutMapping("/records/{recordId}")
    public ResponseEntity<VaccinationRecordDTO> updateVaccinationRecord(
            @PathVariable Long recordId,
            @AuthenticationPrincipal User nurse,
            @RequestBody VaccinationRecordDTO recordDTO) {
        try {
            VaccinationRecordDTO record = campaignService.updateVaccinationRecord(recordId, recordDTO, nurse);
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Request campaign completion (sends request to manager for approval)
     */
    @PostMapping("/{id}/request-completion")
    public ResponseEntity<?> requestCampaignCompletion(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String requestReason = requestBody != null ? requestBody.get("requestReason") : null;
            String completionNotes = requestBody != null ? requestBody.get("completionNotes") : null;
            
            CampaignCompletionRequestDTO request = campaignService.requestCampaignCompletion(id, nurse, requestReason, completionNotes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Yêu cầu hoàn thành chiến dịch đã được gửi đến quản lý để duyệt");
            response.put("request", request);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Không thể tạo yêu cầu hoàn thành chiến dịch: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all campaigns (for overview)
     */
    @GetMapping
    public ResponseEntity<List<VaccinationCampaignDTO>> getAllCampaigns() {
        List<VaccinationCampaignDTO> campaigns = campaignService.getAllCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get campaigns by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<VaccinationCampaignDTO>> getCampaignsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            VaccinationCampaign.CampaignStatus campaignStatus = VaccinationCampaign.CampaignStatus.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<VaccinationCampaignDTO> campaigns = campaignService.getCampaignsByStatus(campaignStatus, pageable);
            return ResponseEntity.ok(campaigns);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
}
