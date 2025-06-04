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
@Table(name = "TreatmentHistory")
public class TreatmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "treatmentType", nullable = false)
    private String treatmentType;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @Column(name = "dateOfAdmission", nullable = false)
    private LocalDate dateOfAdmission;

    @Column(name = "dateOfDischarge", nullable = true)
    private LocalDate dateOfDischarge;

    @Column(name = "placeOfTreatment", nullable = true)
    private String placeOfTreatment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DiseaseStatus status;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;
}
