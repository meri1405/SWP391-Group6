package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaccinationFormDTO {
    private Long id;
    private String vaccineName;
    private String vaccineBrand;
    private Integer doseNumber;
    private LocalDateTime scheduledDate;
    private String location;
    private String prePostCareInstructions;
    private String confirmationStatus;
    private LocalDateTime confirmationDate;
    private LocalDateTime createdDate;
    private LocalDateTime sentDate;
    private String parentNotes;
    private String additionalInfo;
    private Boolean isActive;
    private Boolean reminderSent;
    private LocalDateTime responseDate;
    
    // Campaign info
    private Long campaignId;
    private String campaignName;
    
    // Student info
    private Long studentId;
    private String studentFullName;
    private String studentCode;
    private String studentClassName;
    private String schoolYear;
    private String studentGender;
    private LocalDate studentBirthDate;
    
    // Parent info
    private Long parentId;
    private String parentFullName;
    private String parentEmail;
    private String parentPhone;
    
    // Created by info
    private Long createdById;
    private String createdByName;
}
