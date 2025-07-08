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
@Table(name = "Hearing")
public class Hearing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "leftEar", nullable = false)
    private int leftEar;

    @Column(name = "rightEar", nullable = false)
    private int rightEar;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "dateOfExamination", nullable = true)
    private LocalDate dateOfExamination;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal;

    @Column(name = "recommendations", nullable = true)
    private String recommendations;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @OneToOne
    @JoinColumn(name = "healthCheckResultId", nullable = true)
    private HealthCheckResult healthCheckResult;
}
