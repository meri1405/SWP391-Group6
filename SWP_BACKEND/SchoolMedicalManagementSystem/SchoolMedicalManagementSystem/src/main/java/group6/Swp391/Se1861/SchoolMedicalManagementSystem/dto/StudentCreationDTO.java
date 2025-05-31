package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating new students and assigning parent relationships
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCreationDTO {
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String className;
    private String birthPlace;
    private String address;
    private String citizenship;
    private String bloodType;
    private boolean isDisabled;
    
    // List of parent IDs to establish parent-child relationships
    private List<Long> parentIds;
}
