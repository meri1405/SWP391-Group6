package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for admin to create new users with different roles
 * Includes STUDENT-specific fields for comprehensive user creation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationDTO {
    // Basic user fields
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String jobTitle;
    private String roleName;
    
    // STUDENT-specific fields (only used when roleName = "STUDENT")
    private String className;
    private String birthPlace;
    private String citizenship;
    private String bloodType;
    private Boolean isDisabled;
    private List<Long> studentIds; // Can be used for parent IDs when creating students
}
