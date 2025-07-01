package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthCheckFormDetailDTO {
    
    // Form basic info
    private Long formId;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private String parentNote;
    private LocalDateTime appointmentTime;
    private String appointmentLocation;
    
    // Campaign details from NURSE
    private Long campaignId;
    private String campaignName;
    private String campaignDescription;
    private LocalDate campaignStartDate;
    private LocalDate campaignEndDate;
    private String campaignLocation;
    private Integer minAge;
    private Integer maxAge;
    private Set<String> targetClasses;
    private String campaignStatus;
    private LocalDateTime campaignCreatedAt;
    
    // Nurse information
    private String nurseFullName;
    private String nurseEmail;
    private String nursePhone;
    
    // Student information
    private Long studentId;
    private String studentFullName;
    private String studentClassName;
    private Integer studentAge;
    private String studentGender;
    
    // Parent information
    private Long parentId;
    private String parentFullName;
    private String parentEmail;
    private String parentPhone;
    
    // Additional details
    private String detailedInstructions;
    private String specialNotes;
    private boolean isUrgent;
    private LocalDateTime deadline;
} 