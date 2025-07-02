package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "medical_event_supplies")
public class MedicalEventSupply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medical_event_id", nullable = false)
    private MedicalEvent medicalEvent;

    @ManyToOne
    @JoinColumn(name = "medical_supply_id", nullable = false)
    private MedicalSupply medicalSupply;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed;

    // Constructor for convenience
    public MedicalEventSupply(MedicalEvent medicalEvent, MedicalSupply medicalSupply, Integer quantityUsed) {
        this.medicalEvent = medicalEvent;
        this.medicalSupply = medicalSupply;
        this.quantityUsed = quantityUsed;
    }
}
