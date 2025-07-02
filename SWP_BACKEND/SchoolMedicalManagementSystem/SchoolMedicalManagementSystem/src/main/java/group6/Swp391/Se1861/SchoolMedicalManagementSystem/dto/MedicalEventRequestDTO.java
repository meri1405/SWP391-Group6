package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalEventRequestDTO {
    private EventType eventType;
    private LocalDateTime occurrenceTime;
    private String location;
    private String symptoms;
    private SeverityLevel severityLevel;
    private String firstAidActions;
    private Long studentId;
    private List<MedicalSupplyUsageDTO> suppliesUsed;
}
