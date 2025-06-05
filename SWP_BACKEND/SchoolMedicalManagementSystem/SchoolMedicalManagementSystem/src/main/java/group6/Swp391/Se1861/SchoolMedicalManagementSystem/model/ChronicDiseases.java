package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.DiseaseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "ChronicDiseases")
public class ChronicDiseases {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "diseaseName", nullable = false)
    private String diseaseName;

    @Column(name = "dateDiagnosed", nullable = true)
    private LocalDate dateDiagnosed;

    @Column(name = "dateResolved", nullable = true)
    private LocalDate dateResolved;

    @Column(name = "placeOfTreatment", nullable = true)
    private String placeOfTreatment;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "dateOfAdmission", nullable = true)
    private LocalDate dateOfAdmission;

    @Column(name = "dateOfDischarge", nullable = true)
    private LocalDate dateOfDischarge;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DiseaseStatus status;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;
}
