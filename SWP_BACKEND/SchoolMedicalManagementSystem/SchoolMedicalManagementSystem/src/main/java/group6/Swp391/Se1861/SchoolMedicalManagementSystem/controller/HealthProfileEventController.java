package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileEventDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfileEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthProfileEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-profile-events")
public class HealthProfileEventController {

    @Autowired
    private IHealthProfileEventService healthProfileEventService;

    @GetMapping("/health-profile/{healthProfileId}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<HealthProfileEventDTO>> getEventsByHealthProfile(@PathVariable Long healthProfileId) {
        try {
            List<HealthProfileEventDTO> events = healthProfileEventService.getEventsByHealthProfile(healthProfileId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/health-profile/{healthProfileId}/recent")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<HealthProfileEventDTO>> getRecentEventsByHealthProfile(
            @PathVariable Long healthProfileId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<HealthProfileEventDTO> events = healthProfileEventService.getRecentEventsByHealthProfile(healthProfileId, limit);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<HealthProfileEventDTO>> getEventsByUser(@PathVariable Long userId) {
        try {
            List<HealthProfileEventDTO> events = healthProfileEventService.getEventsByUser(userId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/action-type/{actionType}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<HealthProfileEventDTO>> getEventsByActionType(@PathVariable HealthProfileEvent.ActionType actionType) {
        try {
            List<HealthProfileEventDTO> events = healthProfileEventService.getEventsByActionType(actionType);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<HealthProfileEventDTO>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<HealthProfileEventDTO> events = healthProfileEventService.getEventsByDateRange(startDate, endDate);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/health-profile/{healthProfileId}/count")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Long> countEventsByHealthProfile(@PathVariable Long healthProfileId) {
        try {
            long count = healthProfileEventService.countEventsByHealthProfile(healthProfileId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Map<String, Object>> getEventStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String groupBy) {
        try {
            Map<String, Object> statistics = healthProfileEventService.getEventStatistics(startDate, endDate, groupBy);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
