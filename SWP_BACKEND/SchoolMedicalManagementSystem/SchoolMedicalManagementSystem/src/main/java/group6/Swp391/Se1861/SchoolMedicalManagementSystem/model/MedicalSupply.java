package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_supplies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalSupply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private String unit;
    
    @Column(nullable = false)
    private Integer minStockLevel;
    
    @Column(nullable = false)
    private LocalDate expirationDate;
    
    @Column(nullable = false)
    private String supplier;
    
    @Column(nullable = false)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public boolean isLowStock() {
        return quantity <= minStockLevel;
    }
    
    public boolean isExpiringSoon(int daysThreshold) {
        return expirationDate.isBefore(LocalDate.now().plusDays(daysThreshold));
    }
    
    public boolean isExpired() {
        return expirationDate.isBefore(LocalDate.now());
    }
}
