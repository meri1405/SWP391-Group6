package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisionDTO {
    private Long id;
    private int visionLeft;
    private int visionRight;
    private int visionLeftWithGlass;
    private int visionRightWithGlass;
    private String visionDescription;
    private String doctorName;
    private LocalDate dateOfExamination;
    private Long healthProfileId;
    private String colorVision;
    private String eyeMovement;
    private Integer eyePressure;
    private boolean needsGlasses;
    private boolean isAbnormal;
    private String recommendations;
}
