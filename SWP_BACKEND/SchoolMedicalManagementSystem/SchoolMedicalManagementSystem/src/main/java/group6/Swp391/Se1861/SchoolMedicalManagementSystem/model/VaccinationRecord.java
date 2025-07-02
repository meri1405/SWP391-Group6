package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "vaccination_record")
public class VaccinationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "vaccine_name", nullable = false, length = 100)
    private String vaccineName;

    @Column(name = "vaccine_brand", nullable = false, length = 100)
    private String vaccineBrand;

    @Column(name = "dose_number", nullable = false)
    private Integer doseNumber;

    @Column(name = "lot_number", length = 50)
    private String lotNumber;

    @Column(name = "vaccination_date", nullable = false)
    private LocalDateTime vaccinationDate;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "source", nullable = false)
    @Enumerated(EnumType.STRING)
    private VaccinationSource source;

    @Column(name = "administered_by", columnDefinition = "TEXT")
    private String administeredBy;

    @Column(name = "adverse_reactions", columnDefinition = "TEXT")
    private String adverseReactions;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "severity_level")
    @Enumerated(EnumType.STRING)
    private SeverityLevel severityLevel;

    @Column(name = "medical_attention_required")
    private Boolean medicalAttentionRequired = false;

    @Column(name = "resolved")
    private Boolean resolved = true;

    @Column(name = "recorded_date", nullable = false)
    private LocalDateTime recordedDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "pre_vaccination_status", length = 50)
    @Enumerated(EnumType.STRING)
    private PreVaccinationStatus preVaccinationStatus;

    @Column(name = "pre_vaccination_notes", columnDefinition = "TEXT")
    private String preVaccinationNotes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private VaccinationCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_rule_id")
    private VaccinationRule vaccinationRule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_id", nullable = false)
    private User recordedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id")
    private User updatedBy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_form_id")
    private VaccinationForm vaccinationForm;

    // Enums
    public enum VaccinationSource {
        SCHOOL_ADMINISTERED("Tiêm tại trường"),
        PARENT_REPORTED("Phụ huynh khai báo"),
        HOSPITAL_ADMINISTERED("Tiêm tại bệnh viện"),
        CLINIC_ADMINISTERED("Tiêm tại phòng khám");

        private final String description;

        VaccinationSource(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum SeverityLevel {
        NONE("Không có phản ứng"),
        MILD("Nhẹ"),
        MODERATE("Trung bình"),
        SEVERE("Nặng"),
        CRITICAL("Nghiêm trọng");

        private final String description;

        SeverityLevel(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum PreVaccinationStatus {
        NORMAL("Bình thường"),
        ABNORMAL("Bất thường"),
        POSTPONED("Hoãn tiêm");

        private final String description;

        PreVaccinationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (recordedDate == null) {
            recordedDate = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (medicalAttentionRequired == null) {
            medicalAttentionRequired = false;
        }
        if (resolved == null) {
            resolved = true;
        }
        if (severityLevel == null) {
            severityLevel = SeverityLevel.NONE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    // Helper methods
    public boolean isSchoolAdministered() {
        return VaccinationSource.SCHOOL_ADMINISTERED.equals(source);
    }

    public boolean isParentReported() {
        return VaccinationSource.PARENT_REPORTED.equals(source);
    }

    public boolean hasAdverseReactions() {
        return adverseReactions != null && !adverseReactions.trim().isEmpty();
    }

    public boolean needsFollowUp() {
        return medicalAttentionRequired != null && medicalAttentionRequired && !resolved;
    }

    public boolean isSevere() {
        return SeverityLevel.SEVERE.equals(severityLevel) || SeverityLevel.CRITICAL.equals(severityLevel);
    }

    public String getStudentFullName() {
        if (student != null) {
            return student.getFirstName() + " " + student.getLastName();
        }
        return null;
    }

    public String getRecordedByName() {
        if (recordedBy != null) {
            return recordedBy.getFirstName() + " " + recordedBy.getLastName();
        }
        return null;
    }

    public String getVaccinationRuleName() {
        if (vaccinationRule != null) {
            return vaccinationRule.getName();
        }
        return null;
    }

    public String getCampaignName() {
        if (campaign != null) {
            return campaign.getName();
        }
        return null;
    }
}
