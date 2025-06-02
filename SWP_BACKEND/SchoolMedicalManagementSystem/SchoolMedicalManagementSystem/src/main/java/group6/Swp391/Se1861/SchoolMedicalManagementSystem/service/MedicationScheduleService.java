package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationScheduleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicationScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationScheduleService {

    private final MedicationScheduleRepository medicationScheduleRepository;

    /**
     * Generate medication schedules for an item request
     * @param itemRequest The medication item request
     * @param startDate The start date for medication
     * @param endDate The end date for medication
     * @return List of created medication schedules
     */
    public List<MedicationSchedule> generateSchedules(ItemRequest itemRequest, LocalDate startDate, LocalDate endDate) {
        List<MedicationSchedule> schedules = new ArrayList<>();

        // Calculate the daily frequency and assign time slots
        LocalTime[] timeSlots = calculateTimeSlots(itemRequest.getFrequency());

        // Create schedules for each day between start and end date
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            for (LocalTime timeSlot : timeSlots) {
                MedicationSchedule schedule = new MedicationSchedule();
                schedule.setItemRequest(itemRequest);
                schedule.setScheduledDate(currentDate);
                schedule.setScheduledTime(timeSlot);
                schedule.setStatus(MedicationStatus.PENDING);

                schedules.add(schedule);
            }
            currentDate = currentDate.plusDays(1);
        }

        return medicationScheduleRepository.saveAll(schedules);
    }

    /**
     * Calculate time slots based on medication frequency
     * @param frequency Daily frequency of medication
     * @return Array of time slots for medication
     */
    private LocalTime[] calculateTimeSlots(int frequency) {
        LocalTime[] timeSlots = new LocalTime[frequency];

        if (frequency == 1) {
            // Once a day - at noon
            timeSlots[0] = LocalTime.of(12, 0);
        } else if (frequency == 2) {
            // Twice a day - morning and evening
            timeSlots[0] = LocalTime.of(8, 0);
            timeSlots[1] = LocalTime.of(18, 0);
        } else if (frequency == 3) {
            // Three times a day - morning, noon, evening
            timeSlots[0] = LocalTime.of(8, 0);
            timeSlots[1] = LocalTime.of(12, 0);
            timeSlots[2] = LocalTime.of(18, 0);
        } else if (frequency == 4) {
            // Four times a day - morning, noon, afternoon, evening
            timeSlots[0] = LocalTime.of(8, 0);
            timeSlots[1] = LocalTime.of(12, 0);
            timeSlots[2] = LocalTime.of(16, 0);
            timeSlots[3] = LocalTime.of(20, 0);
        } else {
            // Default to evenly spaced throughout the day
            int intervalHours = 24 / frequency;
            for (int i = 0; i < frequency; i++) {
                timeSlots[i] = LocalTime.of((8 + i * intervalHours) % 24, 0);
            }
        }

        return timeSlots;
    }

    /**
     * Update medication schedule status
     * @param scheduleId The schedule ID
     * @param status New status
     * @param nurse Nurse who updated the status
     * @param note Optional nurse note
     * @return Updated medication schedule
     */
    public MedicationScheduleDTO updateScheduleStatus(Long scheduleId, MedicationStatus status, User nurse, String note) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setStatus(status);
        schedule.setNurse(nurse);
        schedule.setNurseNote(note);

        if (status == MedicationStatus.TAKEN) {
            schedule.setAdministeredTime(LocalTime.now());
        }

        return convertToDTO(medicationScheduleRepository.save(schedule));
    }    /**
     * Get schedules for a medication request
     * @param medicationRequestId The medication request ID
     * @return List of schedules for the medication request
     */
    public List<MedicationScheduleDTO> getSchedulesForMedicationRequest(Long medicationRequestId) {
        return medicationScheduleRepository.findByItemRequestMedicationRequestId(medicationRequestId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }/**
     * Get schedules for a student
     * @param studentId The student ID
     * @return List of schedules for the student
     */
    public List<MedicationScheduleDTO> getSchedulesForStudent(Long studentId) {
        return medicationScheduleRepository.findByItemRequestMedicationRequestStudentStudentID(studentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }/**
     * Get schedules for a specific date
     * @param date The date to check
     * @return List of schedules for the specified date
     */
    public List<MedicationScheduleDTO> getSchedulesByDate(LocalDate date) {
        return medicationScheduleRepository.findAll().stream()
                .filter(schedule -> schedule.getScheduledDate().equals(date))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    /**
     * Get schedules for a specific date and status
     * @param date The date to check
     * @param status The status to filter by
     * @return List of schedules for the specified date and status
     */
    public List<MedicationScheduleDTO> getSchedulesByDateAndStatus(LocalDate date, MedicationStatus status) {
        return medicationScheduleRepository.findByScheduledDateAndStatus(date, status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete all medication schedules associated with a specific item request
     * @param itemRequestId The ID of the item request
     */
    public void deleteSchedulesForItemRequest(Long itemRequestId) {
        // Find all schedules for this item request and delete them
        List<MedicationSchedule> schedules = medicationScheduleRepository.findByItemRequestId(itemRequestId);
        medicationScheduleRepository.deleteAll(schedules);
    }

    /**
     * Update medication schedule note only
     * @param scheduleId The schedule ID
     * @param nurse Nurse who updated the note
     * @param note New note content
     * @return Updated medication schedule
     */
    public MedicationScheduleDTO updateScheduleNote(Long scheduleId, User nurse, String note) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setNurseNote(note);
        schedule.setNurse(nurse);

        return convertToDTO(medicationScheduleRepository.save(schedule));
    }

    /**
     * Convert entity to DTO
     * @param schedule The medication schedule entity
     * @return The DTO representation
     */
    private MedicationScheduleDTO convertToDTO(MedicationSchedule schedule) {
        MedicationScheduleDTO dto = new MedicationScheduleDTO();
        dto.setId(schedule.getId());
        dto.setItemRequestId(schedule.getItemRequest().getId());
        dto.setMedicationName(schedule.getItemRequest().getItemName());
        dto.setScheduledDate(schedule.getScheduledDate());
        dto.setScheduledTime(schedule.getScheduledTime());
        dto.setStatus(schedule.getStatus());
        dto.setAdministeredTime(schedule.getAdministeredTime());
        dto.setNurseNote(schedule.getNurseNote());

        if (schedule.getNurse() != null) {
            dto.setNurseId(schedule.getNurse().getId());
            dto.setNurseName(schedule.getNurse().getLastName() + " " + schedule.getNurse().getFirstName());
        }

        // Get student info from the medication request
        Student student = schedule.getItemRequest().getMedicationRequest().getStudent();
        dto.setStudentId(student.getStudentID());
        dto.setStudentName(student.getLastName() + " " + student.getFirstName());
        dto.setClassName(student.getClassName());

        return dto;
    }

    /**
     * Convert a MedicationSchedule entity to a MedicationScheduleDTO
     * @param schedule The medication schedule entity
     * @return The medication schedule DTO
     */
    public MedicationScheduleDTO convertToScheduleDTO(MedicationSchedule schedule) {
        MedicationScheduleDTO dto = new MedicationScheduleDTO();
        dto.setId(schedule.getId());
        dto.setItemRequestId(schedule.getItemRequest().getId());
        dto.setMedicationName(schedule.getItemRequest().getItemName());
        dto.setScheduledDate(schedule.getScheduledDate());
        dto.setScheduledTime(schedule.getScheduledTime());
        dto.setStatus(schedule.getStatus());
        dto.setAdministeredTime(schedule.getAdministeredTime());
        dto.setNurseNote(schedule.getNurseNote());

        // Set nurse info if available
        if (schedule.getNurse() != null) {
            dto.setNurseId(schedule.getNurse().getId());
            dto.setNurseName(schedule.getNurse().getLastName() + " " + schedule.getNurse().getFirstName());
        }

        // Set student info
        Student student = schedule.getItemRequest().getMedicationRequest().getStudent();
        if (student != null) {
            dto.setStudentId(student.getStudentID());
            dto.setStudentName(student.getLastName() + " " + student.getFirstName());
            dto.setClassName(student.getClassName());
        }

        // Set dosage
        dto.setDosage(schedule.getItemRequest().getDosage());

        return dto;
    }

    /**
     * Convert a list of MedicationSchedule entities to DTOs
     * @param schedules List of medication schedule entities
     * @return List of medication schedule DTOs
     */
    public List<MedicationScheduleDTO> convertToScheduleDTOList(List<MedicationSchedule> schedules) {
        return schedules.stream()
            .map(this::convertToScheduleDTO)
            .collect(Collectors.toList());
    }
}
