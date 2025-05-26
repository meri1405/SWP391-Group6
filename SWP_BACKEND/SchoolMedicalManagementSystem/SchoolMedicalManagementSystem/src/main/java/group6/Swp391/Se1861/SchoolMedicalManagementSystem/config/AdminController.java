package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.config.AdminOnly;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for admin-only operations
 * All endpoints in this controller require ADMIN role
 */
@RestController
@RequestMapping("/api/admin")
@AdminOnly(message = "Admin access required for all operations in this controller")
public class AdminController {

    /**
     * Get admin dashboard data
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("message", "Welcome to Admin Dashboard");
        dashboardData.put("adminUser", user.getUsername());
        dashboardData.put("role", user.getRole().getRoleName());
        dashboardData.put("totalUsers", 1234);
        dashboardData.put("totalParents", 856);
        dashboardData.put("totalStudents", 2341);
        dashboardData.put("totalHealthRecords", 1567);
        
        return ResponseEntity.ok(dashboardData);
    }

    /**
     * Get all users (admin only)
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "List of all users");
        response.put("users", "User data would be here");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get system statistics (admin only)
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogins", 5432);
        stats.put("activeUsers", 234);
        stats.put("systemUptime", "99.9%");
        stats.put("lastBackup", "2024-01-15 02:00:00");
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Update system settings (admin only)
     */
    @PostMapping("/settings")
    public ResponseEntity<?> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "System settings updated successfully");
        response.put("updatedSettings", settings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user (admin only)
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        response.put("deletedUserId", userId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get admin profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().getRoleName());
        profile.put("lastLogin", "2024-01-15 10:30:00");
        
        return ResponseEntity.ok(profile);
    }
} 