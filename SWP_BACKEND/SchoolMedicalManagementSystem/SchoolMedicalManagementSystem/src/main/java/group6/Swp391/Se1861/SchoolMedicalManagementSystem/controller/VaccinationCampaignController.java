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

@RestController
@RequestMapping("/api/nurse/vaccination-campaigns")
@RequiredArgsConstructor
public class VaccinationCampaignController {

    private final IVaccinationCampaignService campaignService;

    /**
     * Create a new vaccination campaign
     */
    @PostMapping
    public ResponseEntity<VaccinationCampaignDTO> createCampaign(
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateVaccinationCampaignRequest request) {
        try {
            VaccinationCampaignDTO campaign = campaignService.createCampaign(nurse, request);
            return new ResponseEntity<>(campaign, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
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
    public ResponseEntity<VaccinationCampaignDTO> updateCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateVaccinationCampaignRequest request) {
        try {
            VaccinationCampaignDTO campaign = campaignService.updateCampaign(id, nurse, request);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
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
            EligibleStudentsResponse response = campaignService.getEligibleStudents(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            String errorMessage = e.getMessage();
            MessageResponse errorResponse = new MessageResponse(errorMessage);
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
     * Complete a campaign
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<VaccinationCampaignDTO> completeCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            VaccinationCampaignDTO campaign = campaignService.completeCampaign(id, nurse);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
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
