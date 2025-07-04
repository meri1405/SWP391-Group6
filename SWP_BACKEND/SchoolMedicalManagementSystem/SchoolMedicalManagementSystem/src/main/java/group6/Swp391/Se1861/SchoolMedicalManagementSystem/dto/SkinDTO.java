package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkinDTO {
    private Long id;
    private String skinColor;
    private boolean rashes;
    private boolean lesions;
    private boolean dryness;
    private boolean eczema;
    private boolean psoriasis;
    private boolean skinInfection;
    private boolean allergies;
    private String description;
    private String treatment;
    private String doctorName;
    private LocalDate dateOfExamination;
    private LocalDate followUpDate;
    private boolean isAbnormal;
    private Long healthProfileId;
    private boolean acne;
    private boolean scars;
    private boolean birthmarks;
    private String skinTone;
    private String recommendations;
}
