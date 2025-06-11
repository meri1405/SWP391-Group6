package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    @Column(name = "createdAt", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updatedAt", nullable = false)
    private LocalDate updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProfileStatus status = ProfileStatus.PENDING;

    @Column(name = "note", nullable = true)
    private String note;

    @ManyToOne
    @JoinColumn(name = "studentId", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "nurseId")
    private User nurse;

    @ManyToOne
    @JoinColumn(name = "parentId")
    private User parent;

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

}
