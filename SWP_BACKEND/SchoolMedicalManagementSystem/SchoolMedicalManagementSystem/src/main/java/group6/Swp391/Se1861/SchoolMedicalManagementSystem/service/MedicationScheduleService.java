package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationScheduleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.UnauthorizedAccessException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicationScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationScheduleService {

    private final MedicationScheduleRepository medicationScheduleRepository;    /**
     * Generate medication schedules for an item request
     * @param itemRequest The medication item request
     * @param startDate The start date for medication
     * @param endDate The end date for medication
     * @return List of created medication schedules
     */
    public List<MedicationSchedule> generateSchedules(ItemRequest itemRequest, LocalDate startDate, LocalDate endDate) {
        List<MedicationSchedule> schedules = new ArrayList<>();

        // Calculate the daily frequency and assign time slots (using custom times if available)
        LocalTime[] timeSlots;
        try {
            timeSlots = calculateTimeSlots(itemRequest);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Failed to generate medication schedules: " + e.getMessage());
        }

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
    }    /**
     * Calculate time slots based on medication frequency and any custom times in the item note
     * @param itemRequest The medication item request containing frequency and note
     * @return Array of time slots for medication
     */    private LocalTime[] calculateTimeSlots(ItemRequest itemRequest) {
        int frequency = itemRequest.getFrequency();
        String note = itemRequest.getNote();
        LocalTime[] timeSlots = new LocalTime[frequency];
        
        // Extract time slots from note JSON
        if (note != null && !note.isEmpty()) {
            int scheduleTimeJsonIndex = note.indexOf("scheduleTimeJson:");
            if (scheduleTimeJsonIndex >= 0) {
                // Extract the JSON part after the marker
                String scheduleTimeJsonStr = note.substring(scheduleTimeJsonIndex + "scheduleTimeJson:".length()).trim();
                
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = mapper.readTree(scheduleTimeJsonStr);
                    
                    if (rootNode.has("scheduleTimes")) {
                        JsonNode timesNode = rootNode.get("scheduleTimes");
                        if (timesNode.isArray()) {
                            // If we have a mismatch between the array size and frequency, throw exception
                            if (timesNode.size() != frequency) {
                                throw new IllegalArgumentException("Number of time slots (" + timesNode.size() + 
                                    ") does not match frequency (" + frequency + ")");
                            }
                                
                            for (int i = 0; i < frequency; i++) {
                                String timeStr = timesNode.get(i).asText();
                                String[] parts = timeStr.split(":");
                                if (parts.length == 2) {
                                    try {
                                        int hour = Integer.parseInt(parts[0]);
                                        int minute = Integer.parseInt(parts[1]);
                                        timeSlots[i] = LocalTime.of(hour, minute);
                                    } catch (NumberFormatException | DateTimeException e) {
                                        throw new IllegalArgumentException("Invalid time format for slot " + (i+1));
                                    }
                                } else {
                                    throw new IllegalArgumentException("Invalid time format for slot " + (i+1));
                                }
                            }
                            
                            return timeSlots;
                        }
                    }
                } catch (Exception e) {
                    throw new IllegalArgumentException("Error parsing schedule times: " + e.getMessage());
                }
            }
        }
        
        throw new IllegalArgumentException("No schedule times provided. Please set medication times for all " + frequency + " slots.");
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

        // Check if the nurse is authorized to update this schedule
        User approvingNurse = schedule.getItemRequest().getMedicationRequest().getNurse();
        if (approvingNurse == null || !approvingNurse.getId().equals(nurse.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this schedule. Only the nurse who approved the request can update its schedules.");
        }

        // Validate that the schedule time has arrived
        LocalDateTime scheduleDateTime = LocalDateTime.of(schedule.getScheduledDate(), schedule.getScheduledTime());
        LocalDateTime now = LocalDateTime.now();
        if (scheduleDateTime.isAfter(now)) {
            throw new IllegalStateException("Cannot update status for future medication schedules");
        }

        schedule.setStatus(status);
        schedule.setNurse(nurse);
        schedule.setNurseNote(note);

        if (status == MedicationStatus.TAKEN || status == MedicationStatus.SKIPPED) {
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
    }    /**
     * Get schedules for a specific date filtered by approving nurse
     * @param date The date to check
     * @param nurse The nurse who approved the requests
     * @return List of schedules for the specified date
     */
    public List<MedicationScheduleDTO> getSchedulesByDateAndNurse(LocalDate date, User nurse) {
        return medicationScheduleRepository.findAll().stream()
                .filter(schedule -> schedule.getScheduledDate().equals(date)
                        && schedule.getItemRequest().getMedicationRequest().getNurse() != null
                        && schedule.getItemRequest().getMedicationRequest().getNurse().getId().equals(nurse.getId())
                        && "APPROVED".equals(schedule.getItemRequest().getMedicationRequest().getStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    /**
     * Get schedules for a specific date and status filtered by approving nurse
     * @param date The date to check
     * @param status The status to filter by
     * @param nurse The nurse who approved the requests
     * @return List of schedules for the specified date and status
     */
    public List<MedicationScheduleDTO> getSchedulesByDateAndStatusAndNurse(LocalDate date, MedicationStatus status, User nurse) {
        return medicationScheduleRepository.findByScheduledDateAndStatus(date, status).stream()
                .filter(schedule -> schedule.getItemRequest().getMedicationRequest().getNurse() != null
                        && schedule.getItemRequest().getMedicationRequest().getNurse().getId().equals(nurse.getId())
                        && "APPROVED".equals(schedule.getItemRequest().getMedicationRequest().getStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    /**
     * Get schedules for a student filtered by approving nurse
     * @param studentId The student ID
     * @param nurse The nurse who approved the requests
     * @return List of schedules for the student
     */
    public List<MedicationScheduleDTO> getSchedulesForStudentAndNurse(Long studentId, User nurse) {
        return medicationScheduleRepository.findByItemRequestMedicationRequestStudentStudentID(studentId).stream()
                .filter(schedule -> schedule.getItemRequest().getMedicationRequest().getNurse() != null
                        && schedule.getItemRequest().getMedicationRequest().getNurse().getId().equals(nurse.getId())
                        && "APPROVED".equals(schedule.getItemRequest().getMedicationRequest().getStatus()))
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

        // Check if the nurse is authorized to update this schedule
        User approvingNurse = schedule.getItemRequest().getMedicationRequest().getNurse();
        if (approvingNurse == null || !approvingNurse.getId().equals(nurse.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this schedule. Only the nurse who approved the request can update its schedules.");
        }

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
