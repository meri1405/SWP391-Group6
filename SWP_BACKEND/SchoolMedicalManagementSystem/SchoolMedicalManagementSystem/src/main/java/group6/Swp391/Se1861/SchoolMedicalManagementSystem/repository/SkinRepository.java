package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Skin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SkinRepository extends JpaRepository<Skin, Long> {

    List<Skin> findByHealthProfile(HealthProfile healthProfile);

    List<Skin> findByHealthProfileOrderByDateOfExaminationDesc(HealthProfile healthProfile);

    List<Skin> findByIsAbnormal(boolean isAbnormal);

    List<Skin> findByRashesOrLesionsOrDryness(boolean rashes, boolean lesions, boolean dryness);

    @Query("SELECT s FROM Skin s WHERE s.healthProfile.id = :healthProfileId AND s.dateOfExamination BETWEEN :startDate AND :endDate")
    List<Skin> findByHealthProfileAndDateRange(Long healthProfileId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT s FROM Skin s WHERE s.healthProfile.student.studentID = :studentId ORDER BY s.dateOfExamination DESC")
    List<Skin> findByStudentIdOrderByDateDesc(Long studentId);
}
