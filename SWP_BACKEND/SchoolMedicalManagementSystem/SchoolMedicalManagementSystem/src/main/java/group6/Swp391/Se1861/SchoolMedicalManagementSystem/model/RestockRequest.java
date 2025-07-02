package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "restock_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestockRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long requestedBy; // User ID of the School Nurse
    
    @Column
    private Long reviewedBy; // User ID of the Manager
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestockStatus status;
    
    @Column(nullable = false)
    private String priority;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(columnDefinition = "TEXT")
    private String reviewNotes;
    
    @Column(nullable = false)
    private LocalDateTime requestDate;
    
    @Column
    private LocalDateTime reviewDate;
    
    @Column
    private LocalDateTime completedDate;
    
    @OneToMany(mappedBy = "restockRequest", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<RestockItem> restockItems;
    
    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = RestockStatus.PENDING;
        }
    }
    
    public enum RestockStatus {
        PENDING,
        APPROVED,
        REJECTED,
        COMPLETED
    }
}
