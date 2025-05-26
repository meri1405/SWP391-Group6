package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Table(name = "VaccinationRule")
public class VaccinationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "doesNumber", nullable = false)
    private int doesNumber;

    @Column(name = "minAge", nullable = false)
    private int minAge;

    @Column(name = "maxAge", nullable = false)
    private int maxAge;

    @Column(name = "intervalDays", nullable = false)
    private int intervalDays;

    @Column(name = "isMandatory", nullable = false)
    private boolean isMandatory;

    @OneToMany(mappedBy = "vaccinationRule", cascade = CascadeType.ALL)
    private List<VaccinationCampaign> vaccinationCampaigns;
}
