package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "ItemRequest")
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ItemRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "itemName", nullable = false)
    private String itemName;

    @Column(name = "purpose", nullable = false)
    private String purpose;

    @Column(name = "itemType", nullable = false)
    private String itemType;

    @Column(name = "dosage", nullable = false)
    private int dosage;

    @Column(name = "frequency", nullable = false)
    private int frequency;

    @Column(name = "note", nullable = true)
    private String note;

    @ManyToOne
    @JoinColumn(name = "medicationRequestId", nullable = false)
    private MedicationRequest medicationRequest;

    @OneToMany(mappedBy = "itemRequest", cascade = CascadeType.ALL)
    private java.util.List<MedicationSchedule> medicationSchedules;
}
