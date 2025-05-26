package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MessageResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.MedicationRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medication-requests")
@PreAuthorize("hasRole('PARENT')")  // Only parents can access these endpoints
public class ParentMedicationRequestController {

    @Autowired
    private MedicationRequestService medicationRequestService;

    /**
     * Create a new medication request
     */
    @PostMapping
    public ResponseEntity<?> createMedicationRequest(
            @Valid @RequestBody MedicationRequestDTO medicationRequestDTO,
            @AuthenticationPrincipal User parent) {

        MedicationRequestDTO createdRequest = medicationRequestService.createMedicationRequest(medicationRequestDTO, parent);
        return ResponseEntity.ok(createdRequest);
    }

    /**
     * Get all medication requests for the authenticated parent
     */
    @GetMapping
    public ResponseEntity<List<MedicationRequestDTO>> getMedicationRequests(@AuthenticationPrincipal User parent) {
        List<MedicationRequestDTO> requests = medicationRequestService.getParentMedicationRequests(parent);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get a specific medication request by ID
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<MedicationRequestDTO> getMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User parent) {

        MedicationRequestDTO request = medicationRequestService.getMedicationRequest(requestId, parent);
        return ResponseEntity.ok(request);
    }
}
