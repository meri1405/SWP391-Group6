package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for admin to create new users with different roles
 * Does not support STUDENT role creation
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
    private String status;
}



