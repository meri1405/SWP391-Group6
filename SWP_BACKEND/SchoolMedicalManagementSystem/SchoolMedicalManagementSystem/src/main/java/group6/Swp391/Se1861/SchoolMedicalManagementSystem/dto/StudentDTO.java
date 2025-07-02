package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {
    private Long studentID;
    private String studentCode;
    private String firstName;
    private String lastName;
    private String className;
    private int age;
    private LocalDate dob;
    private String gender;
    private String birthPlace;
    private String address;
    private String citizenship;
    private boolean isDisabled;
    private Long motherId;
    private Long fatherId;
    
    // Parent information
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    
    // Additional fields for frontend compatibility
    public Long getId() {
        return studentID;
    }
    
    public String getName() {
        return firstName + " " + lastName;
    }
    
    public String getClass_() {
        return className;
    }

    public String getFullName() {
        return lastName + " " + firstName;
    }
}
