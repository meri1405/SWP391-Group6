package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent/vaccination-forms")
@PreAuthorize("hasRole('PARENT')")
@RequiredArgsConstructor
public class ParentVaccinationController {

    private final IVaccinationFormService formService;

    /**
     * Get all vaccination forms for the authenticated parent
     */
    @GetMapping
    public ResponseEntity<List<VaccinationFormDTO>> getMyVaccinationForms(
            @AuthenticationPrincipal User parent) {
        List<VaccinationFormDTO> forms = formService.getFormsByParent(parent);
        return ResponseEntity.ok(forms);
    }

    /**
     * Get pending vaccination forms for the authenticated parent
     */
    @GetMapping("/pending")
    public ResponseEntity<List<VaccinationFormDTO>> getPendingVaccinationForms(
            @AuthenticationPrincipal User parent) {
        List<VaccinationFormDTO> forms = formService.getPendingFormsByParent(parent);
        return ResponseEntity.ok(forms);
    }

    /**
     * Get specific vaccination form by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVaccinationFormById(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            VaccinationFormDTO form = formService.getFormById(id);
            
            // Check if the form belongs to the authenticated parent
            if (!form.getParentId().equals(parent.getId())) {
                response.put("success", false);
                response.put("message", "You are not authorized to view this vaccination form");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
            
            response.put("success", true);
            response.put("form", form);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Vaccination form not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Confirm vaccination consent
     * Business rule: Parent has 48 hours from form sent date to confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmVaccination(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get form to check timing and authorization
            VaccinationFormDTO form = formService.getFormById(id);
            
            // Check authorization
            if (!form.getParentId().equals(parent.getId())) {
                response.put("success", false);
                response.put("message", "You are not authorized to confirm this vaccination form");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
            
            // Validate 48-hour confirmation window
            LocalDateTime sentDate = form.getSentDate();
            if (sentDate != null) {
                LocalDateTime now = LocalDateTime.now();
                long hoursElapsed = ChronoUnit.HOURS.between(sentDate, now);
                
                if (hoursElapsed > 48) {
                    response.put("success", false);
                    response.put("message", "Confirmation deadline exceeded. Forms must be confirmed within 48 hours of being sent.");
                    response.put("hoursElapsed", hoursElapsed);
                    response.put("maxHours", 48);
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                
                response.put("hoursElapsed", hoursElapsed);
                response.put("remainingHours", 48 - hoursElapsed);
            }
            
            String parentNotes = request.get("notes");
            VaccinationFormDTO confirmedForm = formService.confirmForm(id, parent, parentNotes);
            
            response.put("success", true);
            response.put("message", "Vaccination consent confirmed successfully");
            response.put("form", confirmedForm);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Decline vaccination consent
     * Business rule: Parent has 48 hours from form sent date to decline
     */
    @PostMapping("/{id}/decline")
    public ResponseEntity<Map<String, Object>> declineVaccination(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get form to check timing and authorization
            VaccinationFormDTO form = formService.getFormById(id);
            
            // Check authorization
            if (!form.getParentId().equals(parent.getId())) {
                response.put("success", false);
                response.put("message", "You are not authorized to decline this vaccination form");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
            
            // Validate 48-hour decline window
            LocalDateTime sentDate = form.getSentDate();
            if (sentDate != null) {
                LocalDateTime now = LocalDateTime.now();
                long hoursElapsed = ChronoUnit.HOURS.between(sentDate, now);
                
                if (hoursElapsed > 48) {
                    response.put("success", false);
                    response.put("message", "Decline deadline exceeded. Forms must be declined within 48 hours of being sent.");
                    response.put("hoursElapsed", hoursElapsed);
                    response.put("maxHours", 48);
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                
                response.put("hoursElapsed", hoursElapsed);
                response.put("remainingHours", 48 - hoursElapsed);
            }
            
            String parentNotes = request.get("notes");
            VaccinationFormDTO declinedForm = formService.declineForm(id, parent, parentNotes);
            
            response.put("success", true);
            response.put("message", "Vaccination consent declined successfully");
            response.put("form", declinedForm);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get vaccination form statistics for parent
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getVaccinationStatistics(
            @AuthenticationPrincipal User parent) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            List<VaccinationFormDTO> allForms = formService.getFormsByParent(parent);
            List<VaccinationFormDTO> pendingForms = formService.getPendingFormsByParent(parent);
            
            long confirmedCount = allForms.stream()
                    .filter(form -> "CONFIRMED".equals(form.getConfirmationStatus()))
                    .count();
            
            long declinedCount = allForms.stream()
                    .filter(form -> "DECLINED".equals(form.getConfirmationStatus()))
                    .count();
            
            long expiredCount = allForms.stream()
                    .filter(form -> "EXPIRED".equals(form.getConfirmationStatus()))
                    .count();
            
            stats.put("total", allForms.size());
            stats.put("pending", pendingForms.size());
            stats.put("confirmed", confirmedCount);
            stats.put("declined", declinedCount);
            stats.put("expired", expiredCount);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error retrieving statistics: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check time constraints for form actions
     */
    @GetMapping("/{id}/time-status")
    public ResponseEntity<Map<String, Object>> getFormTimeStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User parent) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            VaccinationFormDTO form = formService.getFormById(id);
            
            // Check authorization
            if (!form.getParentId().equals(parent.getId())) {
                response.put("success", false);
                response.put("message", "You are not authorized to view this vaccination form");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
            
            response.put("success", true);
            response.put("formId", id);
            response.put("confirmationStatus", form.getConfirmationStatus());
            
            LocalDateTime sentDate = form.getSentDate();
            if (sentDate != null) {
                LocalDateTime now = LocalDateTime.now();
                long hoursElapsed = ChronoUnit.HOURS.between(sentDate, now);
                
                response.put("sentDate", sentDate);
                response.put("currentTime", now);
                response.put("hoursElapsed", hoursElapsed);
                response.put("remainingHours", Math.max(0, 48 - hoursElapsed));
                response.put("canConfirmOrDecline", hoursElapsed <= 48);
                
                if (hoursElapsed > 48) {
                    response.put("message", "48-hour deadline for confirmation/decline has passed");
                } else {
                    response.put("message", String.format("%.1f hours remaining for confirmation/decline", (48.0 - hoursElapsed)));
                }
            } else {
                response.put("message", "Form has not been sent yet");
                response.put("canConfirmOrDecline", false);
            }
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Vaccination form not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
