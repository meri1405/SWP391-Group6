package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventResponseDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalEventService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.ISchoolNurseHealthProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-events")
@RequiredArgsConstructor
public class MedicalEventController {

    private final IMedicalEventService IMedicalEventService;
    private final UserRepository userRepository;
    private final ISchoolNurseHealthProfileService healthProfileService;

    @PostMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<MedicalEventResponseDTO> createMedicalEvent(
            @RequestBody MedicalEventRequestDTO requestDTO,
            Authentication authentication) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());

        // Validate that student has approved health profile
        if (!healthProfileService.hasApprovedHealthProfile(requestDTO.getStudentId())) {
            return ResponseEntity.badRequest()
                    .body(null); // Return error response indicating student has no health profile
        }

        MedicalEventResponseDTO responseDTO = IMedicalEventService.createMedicalEvent(requestDTO, userId);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER', 'PARENT')")
    public ResponseEntity<MedicalEventResponseDTO> getMedicalEventById(@PathVariable Long id) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getAllMedicalEvents() {
        return ResponseEntity.ok(IMedicalEventService.getAllMedicalEvents());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getPendingMedicalEvents() {
        return ResponseEntity.ok(IMedicalEventService.getPendingMedicalEvents());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER', 'PARENT')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEventsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventsByStudent(studentId));
    }

    @GetMapping("/type/{eventType}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEventsByType(
            @PathVariable EventType eventType) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventsByEventType(eventType));
    }

    @GetMapping("/severity/{severityLevel}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEventsBySeverity(
            @PathVariable SeverityLevel severityLevel) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventsBySeverityLevel(severityLevel));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventsByDateRange(startDate, endDate));
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEventsByClass(@PathVariable String className) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventsByClass(className));
    }

    @GetMapping("/class/{className}/date-range")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEventsByClassAndDateRange(
            @PathVariable String className,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(IMedicalEventService.getMedicalEventsByClassAndDateRange(className, startDate, endDate));
    }

    @PatchMapping("/{id}/process")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<MedicalEventResponseDTO> processMedicalEvent(
            @PathVariable Long id,
            Authentication authentication) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());

        return ResponseEntity.ok(IMedicalEventService.processMedicalEvent(id, userId));
    }
    
    /**
     * Check if student has approved health profile
     */
    @GetMapping("/check-health-profile/{studentId}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<Map<String, Object>> checkStudentHealthProfile(@PathVariable Long studentId) {
        boolean hasProfile = healthProfileService.hasApprovedHealthProfile(studentId);
        HealthProfileDTO profile = null;
        
        if (hasProfile) {
            profile = healthProfileService.getApprovedHealthProfileByStudentId(studentId);
        }
        
        return ResponseEntity.ok(Map.of(
                "hasApprovedProfile", hasProfile,
                "message", hasProfile ? "Học sinh đã được khai báo hồ sơ sức khỏe" : "Học sinh chưa được phụ huynh khai báo hồ sơ sức khỏe",
                "profile", profile != null ? profile : Map.of()
        ));
    }

    // Helper method to get user ID from username
    private Long getUserIdFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return user.getId();
    }
}
