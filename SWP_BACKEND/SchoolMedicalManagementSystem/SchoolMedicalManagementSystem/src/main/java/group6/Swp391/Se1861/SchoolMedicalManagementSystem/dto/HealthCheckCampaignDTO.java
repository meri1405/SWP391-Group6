package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthCheckCampaignDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private Set<HealthCheckCategory> categories;
    private CampaignStatus status;
    private String notes;
    private Integer targetCount;
    private Integer minAge;
    private Integer maxAge;
    private Set<String> targetClasses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    
    // Creator info
    private Long createdById;
    private String createdByName;
    
    // Approver info
    private Long approvedById;
    private String approvedByName;
    
    // Schedule info
    private TimeSlot timeSlot;
    private String scheduleNotes;
    private Integer confirmedCount; // Number of students confirmed by parents
}
