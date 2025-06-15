package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "VaccinationHistory")
public class VaccinationHistory {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vaccineName", nullable = false)
    private String vaccineName;

    @Column(name = "doseNumber", nullable = false)
    private int doseNumber;

    @Column(name = "manufacturer", nullable = true)
    private String manufacturer;

    @Column(name = "dateOfVaccination", nullable = false)
    private LocalDate dateOfVaccination;

    @Column(name = "placeOfVaccination", nullable = false)
    private String placeOfVaccination;

    @Column(name = "administeredBy", nullable = true)
    private String administeredBy;    @Column(name = "notes", nullable = true)
    private String notes;

    @Column(name = "status", nullable = false)
    private boolean status;

    @Column(name = "source", nullable = false)
    @Enumerated(EnumType.STRING)
    private VaccinationSource source;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @ManyToOne
    @JoinColumn(name = "vaccinationRuleId", nullable = true)
    private VaccinationRule vaccinationRule;

    public enum VaccinationSource {
        SCHOOL_ADMINISTERED, PARENT_REPORTED
    }

}
