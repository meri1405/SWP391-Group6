package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for School Nurse access to Student data
 * Provides endpoints for medical event management and student lookup
 */
@RestController
@RequestMapping("/api/nurse/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SchoolNurseStudentController {

    @Autowired
    private IStudentService studentService;

    /**
     * Get all students for medical event management
     * School nurses need access to all students for medical events
     */
    @GetMapping
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('ADMIN')")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        try {
            List<StudentDTO> students = studentService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Alternative endpoint with simpler authorization
     * Try with just authentication, no specific role required
     */
    @GetMapping("/all")
    public ResponseEntity<List<StudentDTO>> getAllStudentsSimple() {
        try {
            // Just check if user is authenticated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            List<StudentDTO> students = studentService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Public endpoint to test if backend is working
     * No authentication required - for debugging
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Backend is working!");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("endpoint", "/api/nurse/students/test");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Debug endpoint to check current user role
     */
    @GetMapping("/debug-user")
    public ResponseEntity<Map<String, Object>> debugCurrentUser() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                response.put("error", "No authentication found");
                return ResponseEntity.ok(response);
            }
            
            response.put("authenticated", authentication.isAuthenticated());
            response.put("principal", authentication.getPrincipal().toString());
            response.put("authorities", authentication.getAuthorities().toString());
            
            if (authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("role", user.getRole().getRoleName());
                response.put("hasSchoolNurseRole", user.getRole().getRoleName().equals("SCHOOLNURSE"));
                response.put("hasAdminRole", user.getRole().getRoleName().equals("ADMIN"));
            }
            
        } catch (Exception e) {
            response.put("error", "Error getting user info: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get student by ID for medical event details
     */
    @GetMapping("/{studentId}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Search students by name or class for medical event form autocomplete
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<StudentDTO>> searchStudents(@RequestParam("q") String query) {
        try {
            List<StudentDTO> allStudents = studentService.getAllStudents();
            
            // Filter students based on search query
            List<StudentDTO> filteredStudents = allStudents.stream()
                .filter(student -> 
                    (student.getFirstName() + " " + student.getLastName())
                        .toLowerCase().contains(query.toLowerCase()) ||
                    student.getClassName().toLowerCase().contains(query.toLowerCase())
                )
                .limit(20) // Limit results for performance
                .toList();
                
            return ResponseEntity.ok(filteredStudents);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}