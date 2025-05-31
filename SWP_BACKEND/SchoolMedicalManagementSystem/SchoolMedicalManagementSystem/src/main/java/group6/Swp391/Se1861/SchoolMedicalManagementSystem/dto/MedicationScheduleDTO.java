package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicationScheduleDTO {
    private Long id;
    private Long itemRequestId;
    private String medicationName;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private MedicationStatus status;
    private LocalTime administeredTime;
    private String nurseNote;
    private Long nurseId;
    private String nurseName;
    private Long studentId;
    private String studentName;
}
