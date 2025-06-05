package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaccinationRuleDTO {
    private Long id;
    private String name;
    private String description;
    private int doesNumber;
    private int minAge;
    private int maxAge;
    private int intervalDays;
    private boolean isMandatory;
}
