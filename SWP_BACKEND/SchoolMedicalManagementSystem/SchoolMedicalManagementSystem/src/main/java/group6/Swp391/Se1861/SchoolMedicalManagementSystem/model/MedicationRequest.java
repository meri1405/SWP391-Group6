package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "MedicationRequest")
public class MedicationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requestDate", nullable = false)
    private LocalDate requestDate = LocalDate.now();

    @Column(name = "note", nullable = false)
    private String note;

    @Column(name = "nurseNote")
    private String nurseNote;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "isConfirm", nullable = false)
    private boolean isConfirm;

    // Add prescription images field - stored as base64 strings
    @ElementCollection
    @CollectionTable(name = "medication_request_images", joinColumns = @JoinColumn(name = "medication_request_id"))
    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private List<String> prescriptionImages;

    @OneToMany(mappedBy = "medicationRequest", cascade = CascadeType.ALL)
    private List<ItemRequest> itemRequests;

    @ManyToOne
    @JoinColumn(name = "nurseID", referencedColumnName = "userID")
    private User nurse;

    @ManyToOne
    @JoinColumn(name = "studentID", referencedColumnName = "studentID")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "parentID", referencedColumnName = "userID")
    private User parent;
}


