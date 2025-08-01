package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;


import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "Student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentID;

    @Column(name ="firstName", nullable = false)
    private String firstName;

    @Column(name ="lastName", nullable = false)
    private String lastName;

    @Column(name ="dob", nullable = false)
    private LocalDate dob;

    @Column(name = "gender", nullable = false, length = 1)
    private String gender;

    @Column(name = "className", nullable = false)
    private String className;

    @Column(name = "schoolYear", nullable = false)
    private String schoolYear;

    @Column(name = "birthPlace", nullable = false)
    private String birthPlace;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "citizenship", nullable = false)
    private String citizenship;

    @Column(name = "isDisabled", nullable = false)
    private boolean isDisabled;

    @ManyToOne
    @JoinColumn(name = "motherId", nullable = true)
    @JsonIgnore
    private User mother;

    @ManyToOne
    @JoinColumn(name = "fatherId", nullable = true)
    @JsonIgnore
    private User father;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private Set<MedicationRequest> medicationRequests;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private HealthProfile healthProfile;

    public String getFullName() {
        return lastName + " " + firstName;
    }

    /**
     * Gets the primary parent contact for the student.
     * Priority: enabled parent > mother > father.
     * Returns the most appropriate parent for communication.
     */
    public User getParent() {
        // Priority: enabled parent > mother > father
        if (mother != null && mother.isEnabled()) {
            return mother;
        } else if (father != null && father.isEnabled()) {
            return father;
        } else if (mother != null) {
            return mother; // Fallback to mother even if disabled
        } else {
            return father; // Fallback to father even if disabled
        }
    }
}
