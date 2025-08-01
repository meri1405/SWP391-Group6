package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "restock_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestockItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restock_request_id", nullable = false)
    private RestockRequest restockRequest;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_supply_id", nullable = false)
    private MedicalSupply medicalSupply;
    
    // Display quantities (what user sees)
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal requestedDisplayQuantity;
    
    @Column(nullable = false, length = 50)
    private String requestedDisplayUnit;
    
    @Column(precision = 15, scale = 6)
    private BigDecimal approvedDisplayQuantity;
    
    @Column(length = 50)
    private String approvedDisplayUnit;
    
    // Base unit quantities (for internal calculations)
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal requestedQuantityInBaseUnit;
    
    @Column(precision = 15, scale = 6)
    private BigDecimal approvedQuantityInBaseUnit;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
