package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Long> {
    List<MedicationSchedule> findByItemRequestMedicationRequestStudentStudentID(Long studentId);
    List<MedicationSchedule> findByScheduledDateAndStatus(LocalDate date, MedicationStatus status);
    List<MedicationSchedule> findByItemRequestId(Long itemRequestId);
    List<MedicationSchedule> findByItemRequestMedicationRequestId(Long medicationRequestId);
}
