package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails, OAuth2User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID", unique = true, nullable = false)
    private Long id;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "firstName", nullable = false)
    private String firstName;

    @Column(name = "lastName", nullable = false)
    private String lastName;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(name = "gender", nullable = false, length = 1)
    private String gender;

    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "jobTitle", nullable = false)
    private String jobTitle;

    @CreatedDate
    @Column(name = "createdDate", nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "lastModifiedDate", nullable = false)
    private LocalDateTime lastModifiedDate;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @ManyToOne
    @JoinColumn(name = "roleID") // FK tới Role.id
    private Role role;

    @ManyToMany
    @JoinTable(
            name = "student_parent",
            joinColumns = @JoinColumn(name = "parent_id"), // vì User giữ role parent, nên joinColumns là parent_id
            inverseJoinColumns = @JoinColumn(name = "student_id",
            referencedColumnName = "studentID") // vì Student giữ role student, nên inverseJoinColumns là student_id
    )
    private Set<Student> students;

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private List<VaccinationCampaign> createdCampaigns;

    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<VaccinationCampaign> managedCampaigns;

    @OneToMany(mappedBy = "nurse", cascade = CascadeType.ALL)
    private List<MedicationRequest> nurseMedicationRequests;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<MedicationRequest> parentMedicationRequests;

    @Transient
    private Map<String, Object> attributes;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.getRoleName().toUpperCase()));
    }

    @Override
    public boolean isEnabled() {
        return enabled != null ? enabled : true;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes == null ? new HashMap<>() : attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(this.id);
    }

    @Override
    public String getUsername() {
        if ("PARENT".equalsIgnoreCase(this.role.getRoleName())) {
            return null;
        }
        return this.username;
    }

    public String getPasswordForNonParent() {
        if ("PARENT".equalsIgnoreCase(this.role.getRoleName())) {
            return null;
        }
        return this.password;
    }

    public String getEmailForNonParent() {
        if ("PARENT".equalsIgnoreCase(this.role.getRoleName())) {
            return null;
        }
        return this.email;
    }
}
