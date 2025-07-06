package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalEventRepository extends JpaRepository<MedicalEvent, Long> {

    @Query("SELECT me FROM MedicalEvent me WHERE me.student = :student AND me.student.isDisabled = false")
    List<MedicalEvent> findByStudent(Student student);

    @Query("SELECT me FROM MedicalEvent me WHERE me.student = :student AND me.student.isDisabled = false ORDER BY me.occurrenceTime DESC")
    List<MedicalEvent> findByStudentOrderByOccurrenceTimeDesc(Student student);

    @Query("SELECT me FROM MedicalEvent me WHERE me.student = :student AND me.student.isDisabled = false ORDER BY me.occurrenceTime DESC")
    Page<MedicalEvent> findByStudentOrderByOccurrenceTimeDesc(Student student, Pageable pageable);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE me.eventType = :eventType AND s.isDisabled = false")
    List<MedicalEvent> findByEventType(EventType eventType);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE me.severityLevel = :severityLevel AND s.isDisabled = false")
    List<MedicalEvent> findBySeverityLevel(SeverityLevel severityLevel);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE me.processed = :processed AND s.isDisabled = false")
    List<MedicalEvent> findByProcessed(boolean processed);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE me.occurrenceTime BETWEEN :start AND :end AND s.isDisabled = false")
    List<MedicalEvent> findByOccurrenceTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE s.className = :className AND s.isDisabled = false")
    List<MedicalEvent> findByClassName(String className);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE s.className = :className AND me.occurrenceTime BETWEEN :startDate AND :endDate AND s.isDisabled = false")
    List<MedicalEvent> findByClassNameAndDateRange(String className, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(me) FROM MedicalEvent me JOIN me.student s WHERE s.className = :className AND me.occurrenceTime BETWEEN :startDate AND :endDate AND s.isDisabled = false")
    long countByClassNameAndDateRange(String className, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(me) FROM MedicalEvent me JOIN me.student s WHERE me.eventType = :eventType AND me.occurrenceTime BETWEEN :startDate AND :endDate AND s.isDisabled = false")
    long countByEventTypeAndDateRange(EventType eventType, LocalDateTime startDate, LocalDateTime endDate);
}
