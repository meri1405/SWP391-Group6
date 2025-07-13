package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HearingDTO {
    private Long id;
    private int leftEar;
    private int rightEar;
    private String description;
    private String doctorName;
    private LocalDate dateOfExamination;
    private Long healthProfileId;
    private Long healthResult;
}
