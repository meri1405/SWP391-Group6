package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HealthProfileDTO {
    private Long id;
    private double weight;
    private double height;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String bloodType;
    private ProfileStatus status;
    private String note;
    private String nurseNote;


    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be a positive number")
    private Long studentId;
    
    private Long nurseId;

    private Long parentId;

    // Lists to hold the related health information
    private List<AllergiesDTO> allergies;
    private List<ChronicDiseasesDTO> chronicDiseases;
    private List<InfectiousDiseasesDTO> infectiousDiseases;
    private List<TreatmentHistoryDTO> treatments;
    private List<VisionDTO> vision;
    private List<HearingDTO> hearing;
    private List<VaccinationHistoryDTO> vaccinationHistory;
    
    // Thông tin bổ sung để hiển thị trên frontend
    private Map<String, Object> additionalFields;
}
