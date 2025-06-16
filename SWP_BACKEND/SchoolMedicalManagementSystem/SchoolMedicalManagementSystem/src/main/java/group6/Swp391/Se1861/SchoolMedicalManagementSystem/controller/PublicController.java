package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SystemSettingsService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

/**
 * Controller for public endpoints that don't require authentication
 */
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private SystemSettingsService systemSettingsService;
    
    @Autowired
    private IStudentService studentService;

    /**
     * Get basic system information - PUBLIC endpoint (no authentication required)
     * This endpoint returns only basic, non-sensitive system information
     */
    @GetMapping("/system-info")
    public ResponseEntity<?> getPublicSystemInfo() {
        return ResponseEntity.ok(systemSettingsService.getPublicSystemInfo());
    }
    
    /**
     * Test endpoint to verify backend is working - COMPLETELY PUBLIC
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testBackend() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "Backend is running!");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("endpoint", "/api/public/test");
        response.put("message", "This endpoint requires NO authentication");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Real students endpoint from database - COMPLETELY PUBLIC
     */
    @GetMapping("/students")
    public ResponseEntity<Map<String, Object>> getRealStudents() {
        try {
            List<StudentDTO> students = studentService.getAllStudents();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Real students from database");
            response.put("students", students);
            response.put("count", students.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Fallback to mock data if database fails
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Mock students (database error: " + e.getMessage() + ")");
            response.put("students", java.util.Arrays.asList(
                Map.of("id", 1, "name", "Nguyễn Văn An", "class", "3A"),
                Map.of("id", 2, "name", "Trần Thị Lan", "class", "5B"),
                Map.of("id", 3, "name", "Lê Văn Minh", "class", "2A")
            ));
            return ResponseEntity.ok(response);
        }
    }
} 