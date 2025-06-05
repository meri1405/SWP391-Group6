package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.DiseaseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentHistoryDTO {
    private Long id;
    private String treatmentType;
    private String description;
    private String doctorName;
    private LocalDate dateOfAdmission;
    private LocalDate dateOfDischarge;
    private String placeOfTreatment;
    private DiseaseStatus status;
    private Long healthProfileId;
}
