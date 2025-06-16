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
    private Long motherId;
    private Long fatherId;
    
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
}
