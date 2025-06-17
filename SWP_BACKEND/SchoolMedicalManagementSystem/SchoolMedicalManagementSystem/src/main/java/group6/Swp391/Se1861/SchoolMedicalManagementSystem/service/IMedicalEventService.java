package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventResponseDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;

import java.time.LocalDateTime;
import java.util.List;

public interface IMedicalEventService {

    MedicalEventResponseDTO createMedicalEvent(MedicalEventRequestDTO requestDTO, Long createdById);

    MedicalEventResponseDTO getMedicalEventById(Long id);

    List<MedicalEventResponseDTO> getAllMedicalEvents();

    List<MedicalEventResponseDTO> getMedicalEventsByStudent(Long studentId);

    List<MedicalEventResponseDTO> getMedicalEventsByEventType(EventType eventType);

    List<MedicalEventResponseDTO> getMedicalEventsBySeverityLevel(SeverityLevel severityLevel);

    List<MedicalEventResponseDTO> getMedicalEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<MedicalEventResponseDTO> getMedicalEventsByClass(String className);

    List<MedicalEventResponseDTO> getMedicalEventsByClassAndDateRange(String className, LocalDateTime startDate, LocalDateTime endDate);

    MedicalEventResponseDTO processMedicalEvent(Long id, Long processedById);

    List<MedicalEventResponseDTO> getPendingMedicalEvents();
}
