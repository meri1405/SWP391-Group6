package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "VaccinationCampaign")
public class VaccinationCampaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "vaccinationType", nullable = false)
    private String vaccinationType;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "planningDate", nullable = false)
    private LocalDate planningDate;

    @Column(name = "creationDate", nullable = false)
    private LocalDate creationDate;

    @Column(name = "status", nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "vaccinationRuleID", referencedColumnName = "id")
    private VaccinationRule vaccinationRule;

    @ManyToOne
    @JoinColumn(name = "createdById")
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "managerId")
    private User manager;
}
