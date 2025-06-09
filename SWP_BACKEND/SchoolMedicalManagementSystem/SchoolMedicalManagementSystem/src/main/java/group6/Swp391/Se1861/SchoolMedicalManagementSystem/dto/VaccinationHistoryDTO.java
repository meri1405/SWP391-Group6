package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VaccinationHistoryDTO {
    private Long id;
    private String vaccineName;
    private int doseNumber;
    private String manufacturer;
    private LocalDate dateOfVaccination;
    private String placeOfVaccination;
    private String administeredBy;
    private String notes;
    private boolean status;
    private Long healthProfileId;
    private Long ruleId;
}
