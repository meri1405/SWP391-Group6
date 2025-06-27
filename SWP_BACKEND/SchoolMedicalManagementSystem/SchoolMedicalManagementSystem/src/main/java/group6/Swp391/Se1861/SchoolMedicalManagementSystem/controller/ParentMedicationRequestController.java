package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationRequestService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.MedicationRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parent/medication-requests")
@RequiredArgsConstructor
public class ParentMedicationRequestController {

    private final IMedicationRequestService medicationRequestService;

    /**
     * Create a new medication request
     * @param medicationRequestDTO Request data
     * @param user Authenticated parent
     * @return Created medication request
     */
    @PostMapping
    public ResponseEntity<MedicationRequestDTO> createMedicationRequest(
            @Valid @RequestBody MedicationRequestDTO medicationRequestDTO,
            @AuthenticationPrincipal User user) {
        MedicationRequestDTO createdRequest = medicationRequestService.createMedicationRequest(medicationRequestDTO, user);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }

    /**
     * Get all medication requests for the authenticated parent
     * @param user Authenticated parent
     * @return List of medication requests
     */
    @GetMapping
    public ResponseEntity<List<MedicationRequestDTO>> getParentMedicationRequests(
            @AuthenticationPrincipal User user) {
        List<MedicationRequestDTO> requests = medicationRequestService.getParentMedicationRequests(user);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get a specific medication request
     * @param requestId Request ID
     * @param user Authenticated parent
     * @return Medication request details
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<MedicationRequestDTO> getMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User user) {
        MedicationRequestDTO request = medicationRequestService.getMedicationRequest(requestId, user);
        return ResponseEntity.ok(request);
    }

    /**
     * Update an existing medication request
     * @param requestId Request ID to update
     * @param medicationRequestDTO Updated request data
     * @param user Authenticated parent
     * @return Updated medication request
     */
    @PutMapping("/{requestId}")
    public ResponseEntity<MedicationRequestDTO> updateMedicationRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody MedicationRequestDTO medicationRequestDTO,
            @AuthenticationPrincipal User user) {
        MedicationRequestDTO updatedRequest = medicationRequestService.updateMedicationRequest(requestId, medicationRequestDTO, user);
        return ResponseEntity.ok(updatedRequest);
    }

    /**
     * Delete a medication request
     * @param requestId Request ID to delete
     * @param user Authenticated parent
     * @return No content response
     */
    @DeleteMapping("/{requestId}")
    public ResponseEntity<Void> deleteMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User user) {
        medicationRequestService.deleteMedicationRequest(requestId, user);
        return ResponseEntity.noContent().build();
    }
}
