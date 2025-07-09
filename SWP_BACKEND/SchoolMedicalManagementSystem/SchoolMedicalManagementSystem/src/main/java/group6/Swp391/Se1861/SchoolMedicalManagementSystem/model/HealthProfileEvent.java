package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "HealthProfileEvent")
public class HealthProfileEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "healthProfileId", nullable = false)
    private HealthProfile healthProfile;

    @ManyToOne
    @JoinColumn(name = "modifiedByUserId", nullable = false)
    private User modifiedByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "actionType", nullable = false)
    private ActionType actionType;

    @Column(name = "fieldChanged", nullable = true)
    private String fieldChanged;

    @Column(name = "oldValue", nullable = true, length = 1000)
    private String oldValue;

    @Column(name = "newValue", nullable = true, length = 1000)
    private String newValue;

    @Column(name = "modifiedAt", nullable = false)
    private LocalDateTime modifiedAt = LocalDateTime.now();

    public enum ActionType {
        CREATE,
        UPDATE,
        DELETE,
        APPROVE,
        REJECT
    }
}
