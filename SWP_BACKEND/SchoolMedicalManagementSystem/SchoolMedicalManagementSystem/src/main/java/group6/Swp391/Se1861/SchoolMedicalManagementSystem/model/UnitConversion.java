package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "unit_conversions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"fromUnit", "toUnit"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UnitConversion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String fromUnit;
    
    @Column(nullable = false, length = 50)
    private String toUnit;
    
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal multiplier;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    public UnitConversion(String fromUnit, String toUnit, BigDecimal multiplier, String description) {
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.multiplier = multiplier;
        this.description = description;
        this.enabled = true;
    }
}
