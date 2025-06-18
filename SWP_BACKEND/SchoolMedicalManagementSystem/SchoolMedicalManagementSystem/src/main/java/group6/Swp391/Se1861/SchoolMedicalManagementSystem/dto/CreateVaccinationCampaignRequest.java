package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateVaccinationCampaignRequest {
    private String name;
    private String description;
    private String location;
    private LocalDateTime scheduledDate;
    private String prePostCareInstructions;
    private Integer estimatedVaccineCount;
    private Long vaccinationRuleId;
    
    // Additional info that nurse can customize
    private String vaccineBrand; // Override from rule if needed
    private String additionalInfo;
}
