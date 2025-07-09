package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfileEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthProfileEventDTO {
    private Long id;
    private Long healthProfileId;
    private Long modifiedByUserId;
    private String modifiedByUserName;
    private HealthProfileEvent.ActionType actionType;
    private String fieldChanged;
    private String oldValue;
    private String newValue;
    private LocalDateTime modifiedAt;
}
