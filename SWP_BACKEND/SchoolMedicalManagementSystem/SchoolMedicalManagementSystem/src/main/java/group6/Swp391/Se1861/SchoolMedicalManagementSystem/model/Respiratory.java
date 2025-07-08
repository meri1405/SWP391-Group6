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
@Table(name = "Respiratory")
public class Respiratory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "breathingRate", nullable = false)
    private int breathingRate;

    @Column(name = "breathingSound", nullable = false)
    private String breathingSound;

    @Column(name = "wheezing", nullable = false)
    private boolean wheezing;

    @Column(name = "cough", nullable = false)
    private boolean cough;

    @Column(name = "breathingDifficulty", nullable = false)
    private boolean breathingDifficulty;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "dateOfExamination", nullable = false)
    private LocalDate dateOfExamination;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal;

    @Column(name = "recommendations", nullable = true)
    private String recommendations;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @OneToOne
    @JoinColumn(name = "healthCheckResultId", nullable = true)
    private HealthCheckResult healthCheckResult;
}