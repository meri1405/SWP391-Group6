package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating Manager Profile Information
 * Contains only the fields that can be updated by the manager
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerProfileUpdateDTO {
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String jobTitle;
}
