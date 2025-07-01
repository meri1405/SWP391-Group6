package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "HealthCheckForm")
public class HealthCheckForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "campaignId", nullable = false)
    private HealthCheckCampaign campaign;

    @ManyToOne
    @JoinColumn(name = "studentId", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "parentId", nullable = false)
    private User parent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FormStatus status = FormStatus.PENDING;

    @Column(name = "sentAt", nullable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(name = "respondedAt", nullable = true)
    private LocalDateTime respondedAt;

    @Column(name = "parentNote", nullable = true, length = 500)
    private String parentNote;

    @Column(name = "appointmentTime", nullable = true)
    private LocalDateTime appointmentTime;

    @Column(name = "appointmentLocation", nullable = true)
    private String appointmentLocation;

    @Column(name = "reminderSent", nullable = false)
    private boolean reminderSent = false;

    @Column(name = "isCheckedIn", nullable = false)
    private boolean isCheckedIn = false;

    @Column(name = "checkedInAt", nullable = true)
    private LocalDateTime checkedInAt;

}
