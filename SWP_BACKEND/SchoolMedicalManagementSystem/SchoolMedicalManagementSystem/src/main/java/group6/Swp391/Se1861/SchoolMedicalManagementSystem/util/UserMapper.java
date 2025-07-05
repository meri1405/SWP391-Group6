package group6.Swp391.Se1861.SchoolMedicalManagementSystem.util;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for mapping User entity to different formats
 */
public class UserMapper {
    
    /**
     * Map User entity to profile Map
     */
    public static Map<String, Object> toProfileMap(User user) {
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
        profile.put("role", user.getRole() != null ? user.getRole().getRoleName() : null);
        
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
        
        return profile;
    }
    
    /**
     * Map User entity to basic info Map
     */
    public static Map<String, Object> toBasicInfoMap(User user) {
        Map<String, Object> basicInfo = new HashMap<>();
        basicInfo.put("id", user.getId());
        basicInfo.put("username", user.getUsername());
        basicInfo.put("firstName", user.getFirstName());
        basicInfo.put("lastName", user.getLastName());
        basicInfo.put("fullName", user.getFirstName() + " " + user.getLastName());
        basicInfo.put("email", user.getEmail());
        basicInfo.put("phone", user.getPhone());
        basicInfo.put("role", user.getRole() != null ? user.getRole().getRoleName() : null);
        
        return basicInfo;
    }
    
    /**
     * Update User entity from profile data Map
     */
    public static void updateFromProfileData(User user, Map<String, Object> profileData) {
        if (profileData.containsKey("firstName")) {
            user.setFirstName((String) profileData.get("firstName"));
        }
        if (profileData.containsKey("lastName")) {
            user.setLastName((String) profileData.get("lastName"));
        }
        if (profileData.containsKey("email")) {
            user.setEmail((String) profileData.get("email"));
        }
        if (profileData.containsKey("phone")) {
            user.setPhone((String) profileData.get("phone"));
        }
        if (profileData.containsKey("address")) {
            user.setAddress((String) profileData.get("address"));
        }
        if (profileData.containsKey("jobTitle")) {
            user.setJobTitle((String) profileData.get("jobTitle"));
        }
        if (profileData.containsKey("gender")) {
            user.setGender((String) profileData.get("gender"));
        }
        if (profileData.containsKey("dob") && profileData.get("dob") != null) {
            try {
                String dobString = (String) profileData.get("dob");
                if (!dobString.trim().isEmpty()) {
                    user.setDob(java.time.LocalDate.parse(dobString));
                }
            } catch (Exception e) {
                // Log error but don't fail the operation
                System.err.println("Error parsing date: " + e.getMessage());
            }
        }
    }
} 