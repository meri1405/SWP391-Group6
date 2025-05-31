package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")  // Only parents can access these endpoints
public class ParentController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get parent profile information
     */    @GetMapping("/profile")
    public ResponseEntity<?> getParentProfile(@AuthenticationPrincipal User parent) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", parent.getId());
        profile.put("firstName", parent.getFirstName());
        profile.put("lastName", parent.getLastName());
        profile.put("phone", parent.getPhone());
        profile.put("email", parent.getEmail());
        profile.put("address", parent.getAddress());
        profile.put("jobTitle", parent.getJobTitle());
          // Format the date to ISO format if it exists
        if (parent.getDob() != null) {
            // Format the date in ISO format (YYYY-MM-DD)
            String formattedDate = parent.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
            profile.put("dateOfBirth", formattedDate);
        } else {
            profile.put("dateOfBirth", null);
        }
        
        profile.put("gender", parent.getGender());
        profile.put("role", parent.getRole().getRoleName());
        
        // Debug print
        System.out.println("Returning parent profile with date of birth: " + 
                          (parent.getDob() != null ? parent.getDob().toString() : "null") + 
                          " and job title: " + parent.getJobTitle());
        
        return ResponseEntity.ok(profile);
    }/**
     * Update parent profile information
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateParentProfile(
            @RequestBody Map<String, Object> profileData,
            @AuthenticationPrincipal User parent) {
        
        try {
            // Update the parent's information with the provided data
            boolean updated = false;

            // Update firstName if provided
            if (profileData.containsKey("firstName") && profileData.get("firstName") != null) {
                String firstName = profileData.get("firstName").toString().trim();
                if (!firstName.isEmpty()) {
                    parent.setFirstName(firstName);
                    updated = true;
                }
            }

            // Update lastName if provided
            if (profileData.containsKey("lastName") && profileData.get("lastName") != null) {
                String lastName = profileData.get("lastName").toString().trim();
                if (!lastName.isEmpty()) {
                    parent.setLastName(lastName);
                    updated = true;
                }
            }

            // Update phone if provided
            if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                String phone = profileData.get("phone").toString().trim();
                if (!phone.isEmpty()) {
                    // Check if phone number is already in use by another user
                    if (userRepository.findByPhone(phone).isPresent() && 
                        !userRepository.findByPhone(phone).get().getId().equals(parent.getId())) {
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("error", "Phone number already in use");
                        errorResponse.put("message", "This phone number is already registered to another user");
                        return ResponseEntity.badRequest().body(errorResponse);
                    }
                    parent.setPhone(phone);
                    updated = true;
                }
            }            // Update address if provided
            if (profileData.containsKey("address")) {
                String address = profileData.get("address") != null ? 
                    profileData.get("address").toString().trim() : "";
                parent.setAddress(address);
                System.out.println("Address updated to: " + address);
                updated = true;
            }
            
            // Update jobTitle if provided
            if (profileData.containsKey("jobTitle")) {
                String jobTitle = profileData.get("jobTitle") != null ? 
                    profileData.get("jobTitle").toString().trim() : 
                    "PARENT";  // Default value if null
                parent.setJobTitle(jobTitle);
                System.out.println("Job title updated to: " + jobTitle);
                updated = true;
            }            // Update dateOfBirth if provided
            if (profileData.containsKey("dateOfBirth")) {
                try {
                    String dobString = profileData.get("dateOfBirth") != null ? 
                        profileData.get("dateOfBirth").toString().trim() : "";
                    
                    if (!dobString.isEmpty()) {
                        // Improved date parsing with better error handling
                        LocalDate dob;
                        try {
                            // Try ISO standard format first (YYYY-MM-DD)
                            dob = LocalDate.parse(dobString, DateTimeFormatter.ISO_LOCAL_DATE);
                        } catch (Exception e1) {
                            try {
                                // Try alternate format as fallback
                                dob = LocalDate.parse(dobString, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                            } catch (Exception e2) {
                                throw new IllegalArgumentException("Could not parse date: " + dobString);
                            }
                        }
                        
                        parent.setDob(dob);
                        System.out.println("Date of birth updated to: " + dob);
                        updated = true;
                    }
                } catch (Exception e) {
                    e.printStackTrace(); // Log the error for troubleshooting
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Invalid date format");
                    errorResponse.put("message", "Date of birth must be in YYYY-MM-DD format. Error: " + e.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            }

            // Update gender if provided
            if (profileData.containsKey("gender") && profileData.get("gender") != null) {
                String gender = profileData.get("gender").toString().trim().toUpperCase();
                if (gender.equals("M") || gender.equals("F")) {
                    parent.setGender(gender);
                    updated = true;
                } else if (!gender.isEmpty()) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Invalid gender");
                    errorResponse.put("message", "Gender must be 'M' or 'F'");
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            }

            // Save changes if any updates were made
            if (updated) {
                userRepository.save(parent);
            }

            // Return updated profile information
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            
            Map<String, Object> updatedProfile = new HashMap<>();
            updatedProfile.put("id", parent.getId());
            updatedProfile.put("firstName", parent.getFirstName());
            updatedProfile.put("lastName", parent.getLastName());
            updatedProfile.put("phone", parent.getPhone());
            updatedProfile.put("email", parent.getEmail());
            updatedProfile.put("address", parent.getAddress());
            updatedProfile.put("jobTitle", parent.getJobTitle());
              // Format the date to ISO format
            if (parent.getDob() != null) {
                // Format the date in ISO format (YYYY-MM-DD)
                String formattedDate = parent.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
                updatedProfile.put("dateOfBirth", formattedDate);
            } else {
                updatedProfile.put("dateOfBirth", null);
            }
            
            updatedProfile.put("gender", parent.getGender());
            updatedProfile.put("role", parent.getRole().getRoleName());
            
            response.put("profile", updatedProfile);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed");
            errorResponse.put("message", "An error occurred while updating the profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

