package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Data
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    @JsonIgnore  // Prevent circular reference during JSON serialization
    private List<User> users;
}
