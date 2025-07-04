package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RespiratoryDTO {
    private Long id;
    private int breathingRate;
    private String breathingSound;
    private boolean wheezing;
    private boolean cough;
    private boolean breathingDifficulty;
    private Integer oxygenSaturation;
    private String treatment;
    private String description;
    private String doctorName;
    private LocalDate dateOfExamination;
    private LocalDate followUpDate;
    private boolean isAbnormal;
    private Long healthProfileId;
    private String chestExpansion;
    private String lungSounds;
    private boolean asthmaHistory;
    private boolean allergicRhinitis;
    private String recommendations;
}
