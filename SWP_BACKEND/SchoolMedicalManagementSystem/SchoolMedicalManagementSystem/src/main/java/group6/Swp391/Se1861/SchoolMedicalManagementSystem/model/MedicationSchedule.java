package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@Table(name = "MedicationSchedule")
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scheduledDate", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduledTime", nullable = false)
    private LocalTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MedicationStatus status = MedicationStatus.PENDING;

    @Column(name = "administeredTime")
    private LocalTime administeredTime;

    @Column(name = "nurseNote")
    private String nurseNote;

    @ManyToOne
    @JoinColumn(name = "nurseId")
    private User nurse;

    @ManyToOne
    @JoinColumn(name = "itemRequestId", nullable = false)
    private ItemRequest itemRequest;
}
