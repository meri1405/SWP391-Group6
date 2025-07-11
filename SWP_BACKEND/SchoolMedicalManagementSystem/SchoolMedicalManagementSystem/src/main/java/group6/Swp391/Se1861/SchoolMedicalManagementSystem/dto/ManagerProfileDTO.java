package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Manager Profile Information
 * Contains all fields from the User model that are relevant for managers
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerProfileDTO {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String jobTitle;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    private Boolean enabled;
    private Boolean firstLogin;
    private String roleName;
    
    // Computed fields for convenience
    private String fullName;
}
