package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCheckFormRepository extends JpaRepository<HealthCheckForm, Long> {

    List<HealthCheckForm> findByCampaign(HealthCheckCampaign campaign);

    List<HealthCheckForm> findByCampaignAndStatus(HealthCheckCampaign campaign, FormStatus status);

    List<HealthCheckForm> findByParent(User parent);

    List<HealthCheckForm> findByParentAndStatus(User parent, FormStatus status);

    List<HealthCheckForm> findByStudent(Student student);

    HealthCheckForm findByCampaignAndStudent(HealthCheckCampaign campaign, Student student);

    @Query("SELECT COUNT(f) FROM HealthCheckForm f WHERE f.campaign = :campaign AND f.status = :status")
    int countByCampaignAndStatus(HealthCheckCampaign campaign, FormStatus status);
}
