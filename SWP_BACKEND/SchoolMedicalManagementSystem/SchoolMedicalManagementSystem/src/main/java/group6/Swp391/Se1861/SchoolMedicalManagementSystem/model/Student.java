package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;


import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "bloodType", nullable = false)
    private String bloodType;

    @Column(name = "isDisabled", nullable = false)
    private boolean isDisabled;

    @ManyToMany(mappedBy = "students") // mappedBy trỏ về tên trường students trong User
    private Set<User> parents;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private Set<MedicationRequest> medicationRequests;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
