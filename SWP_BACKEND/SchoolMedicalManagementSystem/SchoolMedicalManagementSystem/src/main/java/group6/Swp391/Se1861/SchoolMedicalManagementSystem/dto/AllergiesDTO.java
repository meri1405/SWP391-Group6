package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.AllergiesStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllergiesDTO {
    private Long id;
    private String allergyType;
    private String description;
    private AllergiesStatus status;
    private LocalDate onsetDate;
    private Long healthProfileId;
}
