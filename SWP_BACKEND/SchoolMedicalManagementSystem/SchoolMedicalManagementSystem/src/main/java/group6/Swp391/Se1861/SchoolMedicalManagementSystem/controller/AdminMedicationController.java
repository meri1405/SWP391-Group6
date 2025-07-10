package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/medication")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class AdminMedicationController {

    private final IMedicationScheduleService medicationScheduleService;
    
    @Value("${medication.schedule.auto-update.enabled:true}")
    private boolean autoUpdateEnabled;
    
    @Value("${medication.schedule.overdue-threshold-minutes:30}")
    private int overdueThresholdMinutes;

    /**
     * Manually trigger auto-update of overdue medication schedules
     * This is for testing and emergency purposes
     */
    @PostMapping("/schedules/auto-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerAutoUpdate() {
        try {
            log.info("Manual trigger of auto-update medication schedules by admin");
            
            int updatedCount = medicationScheduleService.autoMarkOverdueSchedulesAsSkipped();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Auto-update completed successfully");
            response.put("updatedSchedules", updatedCount);
            response.put("timestamp", LocalDateTime.now());
            
            log.info("Manual auto-update completed. Updated {} schedules", updatedCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error during manual auto-update: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error during auto-update: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get auto-update configuration status
     */
    @GetMapping("/schedules/auto-update/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAutoUpdateStatus() {
        
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", autoUpdateEnabled);
        status.put("overdueThresholdMinutes", overdueThresholdMinutes);
        status.put("description", "Automatically marks medication schedules as SKIPPED when they are " + 
                                overdueThresholdMinutes + " minutes past due");
        
        Map<String, Object> schedule = new HashMap<>();
        schedule.put("regularCheck", "Every 15 minutes");
        schedule.put("schoolHoursCheck", "Every 5 minutes (7 AM - 6 PM, Mon-Fri)");
        status.put("scheduleFrequency", schedule);
        
        return ResponseEntity.ok(status);
    }

    /**
     * Get current system time for debugging timezone issues
     */
    @GetMapping("/system/time")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemTime() {
        Map<String, Object> response = new HashMap<>();
        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        response.put("currentTime", LocalDateTime.now());
        response.put("currentTimeVietnam", LocalDateTime.now(vietnamZone));
        response.put("currentDate", LocalDate.now());
        response.put("currentTimeOnly", LocalTime.now());
        response.put("systemTimezone", ZoneId.systemDefault().toString());
        response.put("configuredTimezone", vietnamZone.toString());
        
        return ResponseEntity.ok(response);
    }
} 