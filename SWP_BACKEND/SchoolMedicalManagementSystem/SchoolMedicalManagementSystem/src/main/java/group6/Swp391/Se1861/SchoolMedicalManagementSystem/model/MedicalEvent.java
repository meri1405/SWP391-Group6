package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "medical_events")
public class MedicalEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "occurrence_time", nullable = false)
    private LocalDateTime occurrenceTime;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity_level", nullable = false)
    private SeverityLevel severityLevel;

    @Column(name = "first_aid_actions", columnDefinition = "TEXT")
    private String firstAidActions;

    @Column(name = "processed", nullable = false)
    private boolean processed = false;

    @Column(name = "processed_time")
    private LocalDateTime processedTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "medicalEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MedicalEventSupply> suppliesUsed = new HashSet<>();

    @OneToMany(mappedBy = "medicalEvent", cascade = CascadeType.ALL)
    private Set<Notification> notifications = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "health_profile_id")
    private HealthProfile healthProfile;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
