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
public class MedicalEventResponseDTO {
    private Long id;
    private EventType eventType;
    private LocalDateTime occurrenceTime;
    private String location;
    private String symptoms;
    private SeverityLevel severityLevel;
    private String firstAidActions;
    private boolean processed;
    private LocalDateTime processedTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private StudentBasicInfoDTO student;
    private UserBasicInfoDTO processedBy;
    private UserBasicInfoDTO createdBy;
    private List<MedicalSupplyUsageResponseDTO> suppliesUsed;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentBasicInfoDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String className;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBasicInfoDTO {
        private Long id;
        private String username;
        private String fullName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalSupplyUsageResponseDTO {
        private Long id;
        private Long medicalSupplyId;
        private String medicalSupplyName;
        private String unit;
        private Integer quantityUsed;
    }
}
