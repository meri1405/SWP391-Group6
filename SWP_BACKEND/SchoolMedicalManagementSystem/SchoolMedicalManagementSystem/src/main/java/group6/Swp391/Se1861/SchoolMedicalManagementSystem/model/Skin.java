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
@Table(name = "Skin")
public class Skin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skinColor", nullable = false)
    private String skinColor;

    @Column(name = "rashes", nullable = false)
    private boolean rashes;

    @Column(name = "lesions", nullable = false)
    private boolean lesions;

    @Column(name = "dryness", nullable = false)
    private boolean dryness;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "dateOfExamination", nullable = false)
    private LocalDate dateOfExamination;

    @Column(name = "doctorName", nullable = true)
    private String doctorName;

    @Column(name = "isAbnormal", nullable = false)
    private boolean isAbnormal;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @Column(name = "eczema", nullable = false)
    private boolean eczema;

    @Column(name = "psoriasis", nullable = false)
    private boolean psoriasis;

    @Column(name = "skinInfection", nullable = false)
    private boolean skinInfection;

    @Column(name = "allergies", nullable = false)
    private boolean allergies;

    @Column(name = "treatment", nullable = true)
    private String treatment;

    @Column(name = "followUpDate", nullable = true)
    private LocalDate followUpDate;
}
