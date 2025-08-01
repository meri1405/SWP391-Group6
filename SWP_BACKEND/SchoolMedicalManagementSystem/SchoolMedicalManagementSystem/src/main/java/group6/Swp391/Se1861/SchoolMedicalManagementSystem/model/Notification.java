package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "Notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    @Lob
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private String notificationType;

    @Column
    private Boolean confirm;

    // Optional reference to related vaccination form
    @ManyToOne
    @JoinColumn(name = "vaccinationFormId")
    private VaccinationForm vaccinationForm;

    @ManyToOne
    @JoinColumn(name = "recipientId", nullable = false)
    private User recipient;

    // Optional reference to related medication request
    @ManyToOne
    @JoinColumn(name = "medicationRequestId")
    private MedicationRequest medicationRequest;

    // Optional reference to related medication schedule
    @ManyToOne
    @JoinColumn(name = "medicationScheduleId")
    private MedicationSchedule medicationSchedule;

    // Optional reference to related medical event
    @ManyToOne
    @JoinColumn(name = "medicalEventId")
    private MedicalEvent medicalEvent;

    // Optional reference to related restock request
    @ManyToOne
    @JoinColumn(name = "restockRequestId")
    private RestockRequest restockRequest;
  
    @ManyToOne
    @JoinColumn(name = "healthCheckFormId")
    private HealthCheckForm healthCheckForm;

    @ManyToOne
    @JoinColumn(name = "healthCheckCampaignId")
    private HealthCheckCampaign healthCheckCampaign;
  
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campaign_completion_request_id")
    private CampaignCompletionRequest campaignCompletionRequest;

}
