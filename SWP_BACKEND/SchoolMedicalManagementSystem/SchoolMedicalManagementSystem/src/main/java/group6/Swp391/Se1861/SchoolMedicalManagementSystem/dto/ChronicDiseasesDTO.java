package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.DiseaseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChronicDiseasesDTO {
    private Long id;
    private String diseaseName;
    private LocalDate dateDiagnosed;
    private LocalDate dateResolved;
    private String placeOfTreatment;
    private String description;
    private LocalDate dateOfAdmission;
    private LocalDate dateOfDischarge;
    private DiseaseStatus status;
    private Long healthProfileId;
}
