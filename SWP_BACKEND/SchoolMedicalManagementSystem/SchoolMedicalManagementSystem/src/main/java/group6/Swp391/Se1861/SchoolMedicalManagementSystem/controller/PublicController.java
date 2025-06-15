package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for public endpoints that don't require authentication
 */
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private SystemSettingsService systemSettingsService;

    /**
     * Get basic system information - PUBLIC endpoint (no authentication required)
     * This endpoint returns only basic, non-sensitive system information
     */
    @GetMapping("/system-info")
    public ResponseEntity<?> getPublicSystemInfo() {
        return ResponseEntity.ok(systemSettingsService.getPublicSystemInfo());
    }
} 