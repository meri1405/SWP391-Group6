package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthCheckFormDTO {
    private Long id;
    private FormStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private String parentNote;
    private LocalDateTime appointmentTime;
    private String appointmentLocation;
    private boolean reminderSent;
    private boolean isCheckedIn;
    private LocalDateTime checkedInAt;
    
    // Campaign info
    private Long campaignId;
    private String campaignName;
    private String campaignDescription;
    private LocalDateTime campaignStartDate;
    private LocalDateTime campaignEndDate;
    private String campaignStatus;
    private String location;
    private Set<String> categories; // Health check categories
    
    // Student info
    private Long studentId;
    private String studentFullName;
    private String studentClassName;
    private String schoolYear;
    private String studentDateOfBirth;
    
    // Parent info
    private Long parentId;
    private String parentFullName;
    private String parentPhone;
}
