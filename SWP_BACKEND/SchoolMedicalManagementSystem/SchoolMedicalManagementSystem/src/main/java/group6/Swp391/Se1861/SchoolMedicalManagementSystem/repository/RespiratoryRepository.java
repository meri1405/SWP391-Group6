package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Respiratory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RespiratoryRepository extends JpaRepository<Respiratory, Long> {

    List<Respiratory> findByHealthProfile(HealthProfile healthProfile);

    List<Respiratory> findByHealthProfileOrderByDateOfExaminationDesc(HealthProfile healthProfile);

    List<Respiratory> findByIsAbnormal(boolean isAbnormal);

    List<Respiratory> findByWheezingOrCoughOrBreathingDifficulty(boolean wheezing, boolean cough, boolean breathingDifficulty);

    @Query("SELECT r FROM Respiratory r WHERE r.healthProfile.id = :healthProfileId AND r.dateOfExamination BETWEEN :startDate AND :endDate")
    List<Respiratory> findByHealthProfileAndDateRange(Long healthProfileId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT r FROM Respiratory r WHERE r.healthProfile.student.studentID = :studentId ORDER BY r.dateOfExamination DESC")
    List<Respiratory> findByStudentIdOrderByDateDesc(Long studentId);
}
