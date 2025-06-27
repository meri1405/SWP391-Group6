package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_supplies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MedicalSupply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(nullable = false, length = 100)
    private String category;
    
    // New unit management fields
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal quantityInBaseUnit;
    
    @Column(nullable = false, length = 50)
    private String baseUnit;
    
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal displayQuantity;
    
    @Column(nullable = false, length = 50)
    private String displayUnit;
    
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal minStockLevelInBaseUnit;
    
    
    @Column(nullable = false)
    private LocalDate expirationDate;
    
    @Column(nullable = false, length = 200)
    private String supplier;
    
    @Column(nullable = false, length = 200)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isLowStock() {
        return quantityInBaseUnit.compareTo(minStockLevelInBaseUnit) <= 0;
    }
    
    public boolean isExpiringSoon(int daysThreshold) {
        return expirationDate.isBefore(LocalDate.now().plusDays(daysThreshold));
    }
    
    public boolean isExpired() {
        return expirationDate.isBefore(LocalDate.now());
    }
    
    public void updateQuantityInBaseUnit(BigDecimal newQuantity) {
        this.quantityInBaseUnit = newQuantity;
    }
    
    public void addToQuantityInBaseUnit(BigDecimal additionalQuantity) {
        this.quantityInBaseUnit = this.quantityInBaseUnit.add(additionalQuantity);
    }
    
    public void subtractFromQuantityInBaseUnit(BigDecimal subtractQuantity) {
        this.quantityInBaseUnit = this.quantityInBaseUnit.subtract(subtractQuantity);
        if (this.quantityInBaseUnit.compareTo(BigDecimal.ZERO) < 0) {
            this.quantityInBaseUnit = BigDecimal.ZERO;
        }
    }
}
