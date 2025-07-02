package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Oral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OralRepository extends JpaRepository<Oral, Long> {

    List<Oral> findByHealthProfile(HealthProfile healthProfile);

    List<Oral> findByHealthProfileOrderByDateOfExaminationDesc(HealthProfile healthProfile);

    List<Oral> findByIsAbnormal(boolean isAbnormal);

    @Query("SELECT o FROM Oral o WHERE o.healthProfile.id = :healthProfileId AND o.dateOfExamination BETWEEN :startDate AND :endDate")
    List<Oral> findByHealthProfileAndDateRange(Long healthProfileId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT o FROM Oral o WHERE o.healthProfile.student.studentID = :studentId ORDER BY o.dateOfExamination DESC")
    List<Oral> findByStudentIdOrderByDateDesc(Long studentId);
}
