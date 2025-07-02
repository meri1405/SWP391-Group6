package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent/health-check-forms")
@RequiredArgsConstructor
public class HealthCheckFormController {

    private final IHealthCheckFormService healthCheckFormService;

    /**
     * Get all health check forms for the authenticated parent
     */
    @GetMapping
    public ResponseEntity<List<HealthCheckFormDTO>> getMyForms(
            @AuthenticationPrincipal User parent) {
        List<HealthCheckFormDTO> forms = healthCheckFormService.getFormsByParent(parent);
        return ResponseEntity.ok(forms);
    }

    /**
     * Get pending health check forms for the authenticated parent
     */
    @GetMapping("/pending")
    public ResponseEntity<List<HealthCheckFormDTO>> getPendingForms(
            @AuthenticationPrincipal User parent) {
        List<HealthCheckFormDTO> forms = healthCheckFormService.getPendingFormsByParent(parent);
        return ResponseEntity.ok(forms);
    }

    /**
     * Get a specific health check form by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HealthCheckFormDTO> getFormById(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent) {
        try {
            HealthCheckFormDTO form = healthCheckFormService.getFormById(id);
            
            // Verify the parent is the owner of this form
            if (!form.getParentId().equals(parent.getId())) {
                return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
            }
            
            return ResponseEntity.ok(form);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Confirm a health check form
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<HealthCheckFormDTO> confirmForm(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent,
            @RequestBody Map<String, String> requestBody) {
        try {
            String parentNote = requestBody.get("parentNote");
            HealthCheckFormDTO form = healthCheckFormService.confirmForm(id, parent, parentNote);
            return ResponseEntity.ok(form);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }
    }

    /**
     * Decline a health check form
     */
    @PostMapping("/{id}/decline")
    public ResponseEntity<HealthCheckFormDTO> declineForm(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent,
            @RequestBody Map<String, String> requestBody) {
        try {
            String parentNote = requestBody.get("parentNote");
            HealthCheckFormDTO form = healthCheckFormService.declineForm(id, parent, parentNote);
            return ResponseEntity.ok(form);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }
    }
}
