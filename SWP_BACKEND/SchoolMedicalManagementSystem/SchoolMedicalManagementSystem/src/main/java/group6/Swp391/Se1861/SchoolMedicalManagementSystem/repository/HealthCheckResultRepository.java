package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthCheckResultRepository extends JpaRepository<HealthCheckResult, Long> {
    List<HealthCheckResult> findByForm(HealthCheckForm form);
    List<HealthCheckResult> findByStudent(Student student);
    List<HealthCheckResult> findByFormAndCategory(HealthCheckForm form, HealthCheckCategory category);
    Optional<HealthCheckResult> findByFormAndStudentAndCategory(HealthCheckForm form, Student student, HealthCheckCategory category);
    List<HealthCheckResult> findByFormAndStudent(HealthCheckForm form, Student student);
    List<HealthCheckResult> findByStudentAndForm_Campaign(Student student, HealthCheckCampaign campaign);
    
    /**
     * Count distinct students who have health check results for a specific campaign
     * @param campaign The health check campaign
     * @return Number of distinct students who have results
     */
    @Query("SELECT COUNT(DISTINCT r.student) FROM HealthCheckResult r WHERE r.form.campaign = :campaign")
    long countDistinctStudentsByCampaign(@Param("campaign") HealthCheckCampaign campaign);
}
