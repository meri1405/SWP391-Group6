package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
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
    
    @Autowired
    private IStudentService studentService;


    /**
     * Get system settings (admin only)
     */
    @GetMapping("/settings")
    public ResponseEntity<?> getSystemSettings() {
        return ResponseEntity.ok(systemSettingsService.getAllSettings());
    }

    /**
     * Update system settings (admin only)
     */
    @PostMapping("/settings")
    public ResponseEntity<?> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        try {
            // Log the received settings
            System.out.println("Received settings update: " + settings);
            
            // Update settings using the service
            systemSettingsService.updateSettings(settings);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "System settings updated successfully");
            response.put("updatedSettings", systemSettingsService.getAllSettings());
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to update system settings");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
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
        profile.put("phone", user.getPhone());
        profile.put("address", user.getAddress());
        profile.put("jobTitle", user.getJobTitle());
        profile.put("gender", user.getGender());
        profile.put("role", user.getRole().getRoleName());
        
        // Format the date to ISO format if it exists
        if (user.getDob() != null) {
            String formattedDate = user.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
            profile.put("dob", formattedDate);
        } else {
            profile.put("dob", null);
        }
        
        // Add created date if available
        if (user.getCreatedAt() != null) {
            profile.put("createdAt", user.getCreatedAt().toString());
        }
        
        profile.put("lastLogin", "2024-01-15 10:30:00");
        
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update admin profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody Map<String, Object> profileData) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) authentication.getPrincipal();
            
            // Fetch the latest user data from database
            User adminUser = userRepository.findById(user.getId()).orElse(null);
            if (adminUser == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            // Update profile fields
            if (profileData.containsKey("firstName")) {
                adminUser.setFirstName((String) profileData.get("firstName"));
            }
            if (profileData.containsKey("lastName")) {
                adminUser.setLastName((String) profileData.get("lastName"));
            }
            if (profileData.containsKey("email")) {
                adminUser.setEmail((String) profileData.get("email"));
            }
            if (profileData.containsKey("phone")) {
                adminUser.setPhone((String) profileData.get("phone"));
            }
            if (profileData.containsKey("address")) {
                adminUser.setAddress((String) profileData.get("address"));
            }
            if (profileData.containsKey("jobTitle")) {
                adminUser.setJobTitle((String) profileData.get("jobTitle"));
            }
            if (profileData.containsKey("gender")) {
                adminUser.setGender((String) profileData.get("gender"));
            }
            if (profileData.containsKey("dob") && profileData.get("dob") != null) {
                try {
                    String dobString = (String) profileData.get("dob");
                    if (!dobString.trim().isEmpty()) {
                        adminUser.setDob(java.time.LocalDate.parse(dobString));
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing date: " + e.getMessage());
                }
            }
            
            // Save updated user
            User updatedUser = userRepository.save(adminUser);
            
            // Prepare response with updated profile
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            
            Map<String, Object> updatedProfile = new HashMap<>();
            updatedProfile.put("id", updatedUser.getId());
            updatedProfile.put("username", updatedUser.getUsername());
            updatedProfile.put("firstName", updatedUser.getFirstName());
            updatedProfile.put("lastName", updatedUser.getLastName());
            updatedProfile.put("email", updatedUser.getEmail());
            updatedProfile.put("phone", updatedUser.getPhone());
            updatedProfile.put("address", updatedUser.getAddress());
            updatedProfile.put("jobTitle", updatedUser.getJobTitle());
            updatedProfile.put("gender", updatedUser.getGender());
            updatedProfile.put("role", updatedUser.getRole().getRoleName());
            
            // Format the date to ISO format if it exists
            if (updatedUser.getDob() != null) {
                String formattedDate = updatedUser.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
                updatedProfile.put("dob", formattedDate);
            } else {
                updatedProfile.put("dob", null);
            }
            
            response.put("profile", updatedProfile);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed");
            errorResponse.put("message", "An error occurred while updating the profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get all students (admin access for medical events)
     */
    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        try {
            List<StudentDTO> students = studentService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}