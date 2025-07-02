package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "HealthCheckCampaign")
public class HealthCheckCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = true, length = 1000)
    private String description;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "endDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "location", nullable = false)
    private String location;

    @ElementCollection(targetClass = HealthCheckCategory.class)
    @CollectionTable(name = "campaign_categories",
                   joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private Set<HealthCheckCategory> categories = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CampaignStatus status = CampaignStatus.PENDING;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "minAge", nullable = true)
    private Integer minAge;

    @Column(name = "maxAge", nullable = true)
    private Integer maxAge;

    @ElementCollection
    @CollectionTable(name = "campaign_target_classes",
                   joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "class_name")
    private Set<String> targetClasses = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "createdById", nullable = false)
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "approvedById", nullable = true)
    private User approvedBy;

    @Column(name = "approvedAt", nullable = true)
    private LocalDateTime approvedAt;

    @Column(name = "notes", nullable = true, length = 1000)
    private String notes;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL)
    private Set<HealthCheckForm> forms = new HashSet<>();

    @Column(name = "confirmedCount", nullable = false)
    private int confirmedCount = 0;

    @Column(name = "targetCount", nullable = false)
    private int targetCount = 0;
}
