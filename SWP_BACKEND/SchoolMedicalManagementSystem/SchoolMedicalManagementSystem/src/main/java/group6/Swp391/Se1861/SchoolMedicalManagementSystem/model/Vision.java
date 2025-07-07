package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "Vision")
public class Vision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visionLeft", nullable = false)
    private int visionLeft;

    @Column(name = "visionRight", nullable = false)
    private int visionRight;

    @Column(name = "visionLeftWithGlass", nullable = true)
    private int visionLeftWithGlass;

    @Column(name = "visionRightWithGlass", nullable = true)
    private int visionRightWithGlass;

    @Column(name = "visionDescription", nullable = true)
    private String visionDescription;

    @Column(name = "dateOfExamination", nullable = true)
    private LocalDate dateOfExamination;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @Column(name = "eyeMovement", nullable = true)
    private String eyeMovement;

    @Column(name = "eyePressure", nullable = true)
    private Integer eyePressure;

    @Column(name = "needsGlasses", nullable = true)
    private boolean needsGlasses;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal;

    @Column(name = "recommendations", nullable = true)
    private String recommendations;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @ManyToOne
    @JoinColumn(name = "healthCheckResultId", nullable = true)
    private HealthCheckResult healthCheckResult;

}
