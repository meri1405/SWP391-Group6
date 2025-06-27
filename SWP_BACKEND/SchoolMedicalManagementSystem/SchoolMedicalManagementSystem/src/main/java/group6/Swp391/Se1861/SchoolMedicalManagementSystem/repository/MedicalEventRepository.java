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

    List<MedicalEvent> findByStudent(Student student);

    List<MedicalEvent> findByStudentOrderByOccurrenceTimeDesc(Student student);

    Page<MedicalEvent> findByStudentOrderByOccurrenceTimeDesc(Student student, Pageable pageable);

    List<MedicalEvent> findByEventType(EventType eventType);

    List<MedicalEvent> findBySeverityLevel(SeverityLevel severityLevel);

    List<MedicalEvent> findByProcessed(boolean processed);

    List<MedicalEvent> findByOccurrenceTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE s.className = :className")
    List<MedicalEvent> findByClassName(String className);

    @Query("SELECT me FROM MedicalEvent me JOIN me.student s WHERE s.className = :className AND me.occurrenceTime BETWEEN :startDate AND :endDate")
    List<MedicalEvent> findByClassNameAndDateRange(String className, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(me) FROM MedicalEvent me JOIN me.student s WHERE s.className = :className AND me.occurrenceTime BETWEEN :startDate AND :endDate")
    long countByClassNameAndDateRange(String className, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(me) FROM MedicalEvent me WHERE me.eventType = :eventType AND me.occurrenceTime BETWEEN :startDate AND :endDate")
    long countByEventTypeAndDateRange(EventType eventType, LocalDateTime startDate, LocalDateTime endDate);
}
