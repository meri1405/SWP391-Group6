package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampaignCompletionRequestDTO {
    private Long id;
    private Long campaignId;
    private String campaignName;
    private String nurseUsername;
    private String nurseName;
    private String requestReason;
    private String completionNotes;
    private LocalDateTime requestDate;
    private LocalDateTime reviewDate;
    private String status; // PENDING, APPROVED, REJECTED
    private String reviewerUsername;
    private String reviewerName;
    private String reviewNotes;
    
    // Statistics for the campaign
    private Integer totalStudents;
    private Integer vaccinatedStudents;
    private Integer postponedStudents;
    private Integer rejectedForms;
} 