package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SystemSettingsService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.ResponseUtils;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for admin-only operations
 * All endpoints in this controller require ADMIN role
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemSettingsService systemSettingsService;

    /**
     * Get system settings (admin only)
     */
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSystemSettings() {
        return ResponseUtils.success(systemSettingsService.getAllSettings());
    }

    /**
     * Update system settings (admin only)
     */
    @PostMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        // Log the received settings
        System.out.println("Received settings update: " + settings);
        
        // Update settings using the service
        systemSettingsService.updateSettings(settings);
        
        return ResponseUtils.success("System settings updated successfully", systemSettingsService.getAllSettings());
    }

    /**
     * Delete user (admin only)
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long userId) {
        // TODO: Implement actual user deletion logic
        return ResponseUtils.success("User deleted successfully");
    }

    /**
     * Get admin profile
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getAdminProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> profile = UserMapper.toProfileMap(user);
        profile.put("lastLogin", "2024-01-15 10:30:00");
        
        return ResponseUtils.success(profile);
    }
    
    /**
     * Update admin profile
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        // Fetch the latest user data from database
        User adminUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update profile fields using UserMapper
        UserMapper.updateFromProfileData(adminUser, profileData);
        
        // Save updated user
        User updatedUser = userRepository.save(adminUser);
        
        // Return updated profile
        Map<String, Object> updatedProfile = UserMapper.toProfileMap(updatedUser);
        
        return ResponseUtils.success("Profile updated successfully", updatedProfile);
    }
}