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
    private String administeredBy;

    @Column(name = "notes", nullable = true)
    private String notes;

    @Column(name = "status", nullable = false)
    private boolean status;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

}
