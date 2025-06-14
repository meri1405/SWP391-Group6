package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    
    @Column(nullable = false)
    private Integer requestedQuantity;
    
    @Column
    private Integer approvedQuantity;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
