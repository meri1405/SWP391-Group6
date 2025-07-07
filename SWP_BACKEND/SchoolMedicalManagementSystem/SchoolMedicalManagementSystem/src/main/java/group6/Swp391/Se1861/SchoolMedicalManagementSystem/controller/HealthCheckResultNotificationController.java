package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultNotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckResultNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/nurse/health-check-results/notifications")
@RequiredArgsConstructor
public class HealthCheckResultNotificationController {

    private final IHealthCheckResultNotificationService healthCheckResultNotificationService;

    /**
     * Send health check results to parents for a completed campaign
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendHealthCheckResults(
            @AuthenticationPrincipal User nurse,
            @RequestBody HealthCheckResultNotificationDTO request) {
        try {
            Map<String, Object> result = healthCheckResultNotificationService.sendHealthCheckResultNotifications(nurse, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Generate a preview of the health check result message for a specific student
     */
    @PostMapping("/preview")
    public ResponseEntity<String> previewHealthCheckResultMessage(
            @AuthenticationPrincipal User nurse,
            @RequestParam Long campaignId,
            @RequestParam String studentId,
            @RequestBody(required = false) String customTemplate) {
        try {
            String preview = healthCheckResultNotificationService.generateHealthCheckResultMessagePreview(
                campaignId, studentId, customTemplate);
            return ResponseEntity.ok(preview);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
