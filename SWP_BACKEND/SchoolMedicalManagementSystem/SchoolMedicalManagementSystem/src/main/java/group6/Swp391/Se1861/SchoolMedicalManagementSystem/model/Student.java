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

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private Set<HealthProfile> healthProfiles;

    public String getFullName() {
        return lastName + " " + firstName;
    }

    /**
     * Gets the primary parent contact for the student.
     * Returns mother if available, otherwise returns father.
     * May return null if no parent is assigned.
     */
    public User getParent() {
        // Return mother as the primary contact if available
        if (mother != null) {
            return mother;
        }
        // Otherwise return father
        return father;
    }
}
