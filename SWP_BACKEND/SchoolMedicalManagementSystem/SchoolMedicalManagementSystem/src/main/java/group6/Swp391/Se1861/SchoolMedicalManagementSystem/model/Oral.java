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

    @Column(name = "dateOfExamination", nullable = true)
    private LocalDate dateOfExamination;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @Column(name = "recommendations", nullable = true)
    private String recommendations;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;
    
    @OneToOne
    @JoinColumn(name = "healthCheckResultId", nullable = true)
    private HealthCheckResult healthCheckResult;
}