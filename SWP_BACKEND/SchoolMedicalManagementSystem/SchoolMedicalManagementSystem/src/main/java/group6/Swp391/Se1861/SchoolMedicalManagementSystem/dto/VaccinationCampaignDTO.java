package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaccinationCampaignDTO {
    private Long id;
    private String name;
    private String description;
    private String vaccineName;
    private String vaccineBrand;
    private String location;
    private LocalDateTime scheduledDate;
    private LocalDateTime createdDate;
    private LocalDateTime approvedDate;
    private String status;
    private String prePostCareInstructions;
    private Integer estimatedVaccineCount;
    private String rejectionReason;
    private LocalDateTime rejectedDate;
    private Boolean reminderSent;
    private Long vaccinationRuleId;
    private String vaccinationRuleName;
    private Long createdById;
    private String createdByName;
    private Long approvedById;
    private String approvedByName;
    private Integer doseNumber; // From vaccination rule
    private Integer minAge; // From vaccination rule (in months)
    private Integer maxAge; // From vaccination rule (in months)
}
