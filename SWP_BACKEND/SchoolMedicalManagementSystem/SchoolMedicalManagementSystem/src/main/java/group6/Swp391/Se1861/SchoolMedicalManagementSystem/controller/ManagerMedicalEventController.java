package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/medical-events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagerMedicalEventController {

    /**
     * Get medical event statistics for manager dashboard
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getMedicalEventStatistics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // For now, return consistent sample data
            // In a real implementation, you would filter by period, dateFrom, dateTo
            stats.put("total", 89);
            stats.put("emergency", 12);
            stats.put("resolved", 76);
            stats.put("pending", 13);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error retrieving medical event statistics: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 