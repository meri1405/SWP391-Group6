package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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

    @Column(name = "vaccineName", nullable = false)
    private String vaccineName;

    @Column(name = "vaccineBrand", nullable = false)
    private String vaccineBrand;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "scheduledDate", nullable = false)
    private LocalDateTime scheduledDate;

    @Column(name = "createdDate", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "approvedDate")
    private LocalDateTime approvedDate;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private CampaignStatus status;

    @Column(name = "prePostCareInstructions", length = 1000)
    private String prePostCareInstructions;

    @Column(name = "estimatedVaccineCount")
    private Integer estimatedVaccineCount;

    @Column(name = "rejectionReason")
    private String rejectionReason;

    @Column(name = "rejectedDate")
    private LocalDateTime rejectedDate;

    @Column(name = "reminderSent", nullable = false)
    private Boolean reminderSent = false;

    @ManyToOne
    @JoinColumn(name = "vaccinationRuleId", referencedColumnName = "id")
    private VaccinationRule vaccinationRule;

    @ManyToOne
    @JoinColumn(name = "createdById")
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "approvedById")
    private User approvedBy;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VaccinationForm> vaccinationForms;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VaccinationRecord> vaccinationRecords;

    public enum CampaignStatus {
        PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (reminderSent == null) {
            reminderSent = false;
        }
    }
}
