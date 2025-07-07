package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "HealthCheckResult")
public class HealthCheckResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "formId", nullable = false)
    private HealthCheckForm form;

    @ManyToOne
    @JoinColumn(name = "studentId", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @ManyToOne
    @JoinColumn(name = "nurseId", nullable = false)
    private User nurse;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private HealthCheckCategory category;

    @Column(name = "weight", nullable = false)
    private double weight;

    @Column(name = "height", nullable = false)
    private double height;

    @Column(name = "bmi", nullable = true)
    private Double bmi;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal = false;

    @Column(name = "resultNotes", nullable = true, length = 1000)
    private String resultNotes;

    @Column(name = "recommendations", nullable = true, length = 1000)
    private String recommendations;

    @Column(name = "performedAt", nullable = false)
    private LocalDateTime performedAt = LocalDateTime.now();

    @Column(name = "syncedToProfile", nullable = false)
    private boolean syncedToProfile = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ResultStatus status = ResultStatus.NORMAL;

    // Reference to the specific result table for each category
    @Column(name = "categoryResultId", nullable = true)
    private Long categoryResultId;

    @Column(name = "parentNotified", nullable = false)
    private boolean parentNotified = false;

    @Column(name = "managerNotified", nullable = false)
    private boolean managerNotified = false;

    // One-to-Many relationships with category-specific results
    @OneToMany(mappedBy = "healthCheckResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vision> visionResults = new ArrayList<>();

    @OneToMany(mappedBy = "healthCheckResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Hearing> hearingResults = new ArrayList<>();

    @OneToMany(mappedBy = "healthCheckResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Oral> oralResults = new ArrayList<>();

    @OneToMany(mappedBy = "healthCheckResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Skin> skinResults = new ArrayList<>();

    @OneToMany(mappedBy = "healthCheckResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Respiratory> respiratoryResults = new ArrayList<>();
}
