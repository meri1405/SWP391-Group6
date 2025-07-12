package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for health check result summary for parents
 * Contains basic information about health check results
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthCheckResultSummaryDTO {
    private Long resultId;
    private Long studentId;
    private String studentName;
    private String studentClass;
    private String schoolYear;
    private String campaignName;
    private String campaignDescription;
    private String location;
    private String category;
    private String status;
    private boolean isAbnormal;
    private double weight;
    private double height;
    private Double bmi;
    private String resultNotes;
    private LocalDateTime performedAt;
    private boolean hasRecommendations;
    private String overallStatus; // NORMAL, NEEDS_ATTENTION, etc.
}
