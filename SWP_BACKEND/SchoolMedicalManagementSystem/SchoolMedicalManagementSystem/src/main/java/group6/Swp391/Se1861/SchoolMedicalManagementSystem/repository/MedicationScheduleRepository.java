package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Long> {
    List<MedicationSchedule> findByItemRequestMedicationRequestStudentStudentID(Long studentId);
    List<MedicationSchedule> findByScheduledDateAndStatus(LocalDate date, MedicationStatus status);
    List<MedicationSchedule> findByItemRequestId(Long itemRequestId);
    List<MedicationSchedule> findByItemRequestMedicationRequestId(Long medicationRequestId);
    
    // New methods for nurse-specific queries
    List<MedicationSchedule> findByItemRequestMedicationRequestNurse(User nurse);
    List<MedicationSchedule> findByStatusAndItemRequestMedicationRequestNurse(MedicationStatus status, User nurse);
    
    /**
     * Find all PENDING schedules that are overdue (more than 30 minutes past scheduled time)
     * Only considers schedules from APPROVED medication requests
     */
    @Query("SELECT ms FROM MedicationSchedule ms " +
           "WHERE ms.status = :status " +
           "AND ((ms.scheduledDate < :currentDate) " +
           "     OR (ms.scheduledDate = :currentDate AND ms.scheduledTime <= :overdueTime)) " +
           "AND ms.itemRequest.medicationRequest.status = 'APPROVED'")
    List<MedicationSchedule> findOverdueSchedules(
        @Param("status") MedicationStatus status,
        @Param("currentDate") LocalDate currentDate,
        @Param("overdueTime") LocalTime overdueTime
    );
}
