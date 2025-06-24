package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCheckResultRepository extends JpaRepository<HealthCheckResult, Long> {

    List<HealthCheckResult> findByForm(HealthCheckForm form);

    List<HealthCheckResult> findByStudent(Student student);

    List<HealthCheckResult> findByHealthProfile(HealthProfile healthProfile);

    List<HealthCheckResult> findByCategory(HealthCheckCategory category);

    List<HealthCheckResult> findByIsAbnormal(boolean isAbnormal);

    List<HealthCheckResult> findByStatus(ResultStatus status);

    List<HealthCheckResult> findByConsultationRequired(boolean consultationRequired);

    @Query("SELECT r FROM HealthCheckResult r WHERE r.form.campaign.id = :campaignId")
    List<HealthCheckResult> findByCampaignId(Long campaignId);

    @Query("SELECT r FROM HealthCheckResult r WHERE r.form.campaign.id = :campaignId AND r.category = :category")
    List<HealthCheckResult> findByCampaignIdAndCategory(Long campaignId, HealthCheckCategory category);

    @Query("SELECT r FROM HealthCheckResult r WHERE r.student.id = :studentId AND r.category = :category ORDER BY r.performedAt DESC")
    List<HealthCheckResult> findLatestByStudentAndCategory(Long studentId, HealthCheckCategory category);

    @Query("SELECT COUNT(r) FROM HealthCheckResult r WHERE r.form.campaign.id = :campaignId AND r.isAbnormal = true")
    int countAbnormalResultsByCampaign(Long campaignId);
}
