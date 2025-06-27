package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckResultDTO {

    private Long formId;
    private HealthCheckCategory category;
    private double weight;
    private double height;
    private boolean isAbnormal;
    private String resultNotes;
    private String recommendations;
    private ResultStatus status;
}
