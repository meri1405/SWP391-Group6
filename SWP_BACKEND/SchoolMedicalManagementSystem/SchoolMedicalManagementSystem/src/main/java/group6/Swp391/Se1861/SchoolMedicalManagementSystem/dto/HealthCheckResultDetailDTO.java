package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for detailed health check result for parents
 * Contains comprehensive information about a specific health check result
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthCheckResultDetailDTO {
    // Basic information
    private Long resultId;
    private Long studentId;
    private String studentName;
    private String studentClass;
    private LocalDate dateOfBirth;
    private String schoolYear;
    private Integer studentAge;
    
    // Campaign information
    private Long campaignId;
    private String campaignName;
    private String campaignDescription;
    private String location;
    
    // Health check details
    private String category;
    private String status;
    private boolean isAbnormal;
    private double weight;
    private double height;
    private Double bmi;
    private String resultNotes;
    private String recommendations;
    private LocalDateTime performedAt;
    
    // Nurse information
    private String nurseName;
    
    // Category-specific details
    private Map<String, Object> categoryDetails;
    
    // Additional information
    private String conclusions;
    private String customMessage;
}
