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
@Table(name = "vaccination_form")
public class VaccinationForm {
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

    @Column(name = "scheduled_date", nullable = false)
    private LocalDateTime scheduledDate;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "pre_post_care_instructions", columnDefinition = "TEXT")
    private String prePostCareInstructions;

    @Column(name = "confirmation_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ConfirmationStatus confirmationStatus;

    @Column(name = "confirmation_date")
    private LocalDateTime confirmationDate;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

    @Column(name = "parent_notes", columnDefinition = "TEXT")
    private String parentNotes;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "reminder_sent", nullable = false)
    private Boolean reminderSent = false;

    @Column(name = "response_date")
    private LocalDateTime responseDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private VaccinationCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    // Enums
    public enum ConfirmationStatus {
        PENDING("Chờ xác nhận"),
        CONFIRMED("Đã xác nhận"),
        DECLINED("Từ chối"),
        EXPIRED("Hết hạn");

        private final String description;

        ConfirmationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (confirmationStatus == null) {
            confirmationStatus = ConfirmationStatus.PENDING;
        }
        if (reminderSent == null) {
            reminderSent = false;
        }
    }

    // Helper methods
    public boolean isPending() {
        return ConfirmationStatus.PENDING.equals(confirmationStatus);
    }

    public boolean isConfirmed() {
        return ConfirmationStatus.CONFIRMED.equals(confirmationStatus);
    }

    public boolean isDeclined() {
        return ConfirmationStatus.DECLINED.equals(confirmationStatus);
    }

    public boolean isExpired() {
        return ConfirmationStatus.EXPIRED.equals(confirmationStatus);
    }

    public String getStudentFullName() {
        if (student != null) {
            return student.getFirstName() + " " + student.getLastName();
        }
        return null;
    }

    public String getParentFullName() {
        if (parent != null) {
            return parent.getFirstName() + " " + parent.getLastName();
        }
        return null;
    }
}
