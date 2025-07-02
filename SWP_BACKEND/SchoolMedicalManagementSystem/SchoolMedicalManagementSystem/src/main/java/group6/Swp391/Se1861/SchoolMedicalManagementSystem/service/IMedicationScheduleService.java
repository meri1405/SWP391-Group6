package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationScheduleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.ItemRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface IMedicationScheduleService {
    List<MedicationSchedule> generateSchedules(ItemRequest itemRequest,
                                               LocalDate startDate,
                                               LocalDate endDate);

    LocalTime[] calculateTimeSlots(ItemRequest itemRequest);

    MedicationScheduleDTO updateScheduleStatus(Long scheduleId,
                                               MedicationStatus status,
                                               User nurse, String note);

    List<MedicationScheduleDTO> getSchedulesForMedicationRequest(Long medicationRequestId);

    List<MedicationScheduleDTO> getSchedulesForStudent(Long studentId);

    List<MedicationScheduleDTO> getSchedulesByDate(LocalDate date);

    List<MedicationScheduleDTO> getSchedulesByDateAndStatus(LocalDate date, MedicationStatus status);

    List<MedicationScheduleDTO> getSchedulesByDateAndNurse(LocalDate date, User nurse);

    List<MedicationScheduleDTO> getSchedulesByDateAndStatusAndNurse(LocalDate date,
                                                                    MedicationStatus status,
                                                                    User nurse);

    List<MedicationScheduleDTO> getSchedulesForStudentAndNurse(Long studentId, User nurse);

    void deleteSchedulesForItemRequest(Long itemRequestId);

    MedicationScheduleDTO updateScheduleNote(Long scheduleId, User nurse, String note);

    MedicationScheduleDTO convertToDTO(MedicationSchedule schedule);

    MedicationScheduleDTO convertToScheduleDTO(MedicationSchedule schedule);

    List<MedicationScheduleDTO> convertToScheduleDTOList(List<MedicationSchedule> schedules);

    MedicationSchedule getMedicationScheduleById(Long scheduleId);

    /**
     * Auto-mark medication schedules as SKIPPED if they are more than 30 minutes overdue
     * @return number of schedules marked as skipped
     */
    int autoMarkOverdueSchedulesAsSkipped();

}
