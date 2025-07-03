package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "campaign_completion_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CampaignCompletionRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private VaccinationCampaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy; // The nurse who requested completion
    
    @Column(name = "request_reason", columnDefinition = "TEXT")
    private String requestReason;
    
    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;
    
    @CreatedDate
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;
    
    @LastModifiedDate
    @Column(name = "review_date")
    private LocalDateTime reviewDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy; // The manager who reviewed the request
    
    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;
    
    // Campaign statistics at the time of request
    @Column(name = "total_students")
    private Integer totalStudents;
    
    @Column(name = "vaccinated_students")
    private Integer vaccinatedStudents;
    
    @Column(name = "postponed_students")
    private Integer postponedStudents;
    
    @Column(name = "rejected_forms")
    private Integer rejectedForms;
    
    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
} 