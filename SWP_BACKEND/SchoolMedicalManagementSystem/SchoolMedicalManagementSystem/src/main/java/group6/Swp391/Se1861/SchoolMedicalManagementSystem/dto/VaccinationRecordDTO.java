package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaccinationRecordDTO {
    private Long id;
    private String vaccineName;
    private String vaccineBrand;
    private Integer doseNumber;
    private String lotNumber;
    private LocalDateTime vaccinationDate;
    private String location;
    private String source;
    private String administeredBy;
    private String adverseReactions;
    private String followUpNotes;
    private LocalDateTime followUpDate;
    private String severityLevel;
    private Boolean medicalAttentionRequired;
    private Boolean resolved;
    private LocalDateTime recordedDate;
    private LocalDateTime updatedDate;
    private Boolean isActive;
    private String notes;
    
    // Pre-vaccination status
    private String preVaccinationStatus;
    private String preVaccinationNotes;
    
    // Student info
    private Long studentId;
    private String studentFullName;
    private String studentCode;
    
    // Campaign info
    private Long campaignId;
    private String campaignName;
    
    // Vaccination rule info
    private Long vaccinationRuleId;
    private String vaccinationRuleName;
    
    // Recorded by info
    private Long recordedById;
    private String recordedByName;
    
    // Updated by info
    private Long updatedById;
    private String updatedByName;
    
    // Vaccination form info
    private Long vaccinationFormId;
}
