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
@Table(name = "Oral")
public class Oral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teethCondition", nullable = false)
    private String teethCondition;

    @Column(name = "gumsCondition", nullable = false)
    private String gumsCondition;

    @Column(name = "tongueCondition", nullable = false)
    private String tongueCondition;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "dateOfExamination", nullable = false)
    private LocalDate dateOfExamination;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal;

    @Column(name = "oralHygiene", nullable = true)
    private String oralHygiene;

    @Column(name = "cavitiesCount", nullable = false)
    private int cavitiesCount;

    @Column(name = "plaquePresent", nullable = false)
    private boolean plaquePresent;

    @Column(name = "gingivitis", nullable = false)
    private boolean gingivitis;

    @Column(name = "mouthUlcers", nullable = false)
    private boolean mouthUlcers;

    @Column(name = "recommendations", nullable = true)
    private String recommendations;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @ManyToOne
    @JoinColumn(name = "healthCheckResultId", nullable = true)
    private HealthCheckResult healthCheckResult;
}
