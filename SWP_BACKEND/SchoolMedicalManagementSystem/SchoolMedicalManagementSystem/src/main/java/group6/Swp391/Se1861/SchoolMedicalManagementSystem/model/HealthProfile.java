package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "HealthProfile")
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "weight", nullable = false)
    private double weight;

    @Column(name = "height", nullable = false)
    private double height;

    @Column(name = "bmi", nullable = true)
    private Double bmi;

    @Column(name = "bloodType", nullable = false)
    private String bloodType;

    @Column(name = "createdAt", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updatedAt", nullable = false)
    private LocalDate updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProfileStatus status = ProfileStatus.PENDING;

    @Column(name = "note", nullable = true)
    private String note;

    @Column(name = "nurseNote", nullable = true)
    private String nurseNote;

    @OneToOne
    @JoinColumn(name = "studentId", nullable = false, unique = true)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "parentId")
    private User parent;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<HealthProfileEvent> events = new HashSet<>();

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<Allergies> allergies;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<ChronicDiseases> chronicDiseases;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<InfectiousDiseases> infectiousDiseases;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<TreatmentHistory> treatments;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<Vision> vision;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<Hearing> hearing;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<VaccinationHistory> vaccinationHistory;

    @OneToMany(mappedBy = "healthProfile", cascade = CascadeType.ALL)
    private Set<MedicalEvent> medicalEvents = new HashSet<>();

}
