package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OralDTO {
    private Long id;
    private String teethCondition;
    private String gumsCondition;
    private String tongueCondition;
    private String description;
    private String doctorName;
    private LocalDate dateOfExamination;
    private boolean isAbnormal;
    private Long healthProfileId;
}
