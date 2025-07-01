package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HealthCheckCampaignRepository extends JpaRepository<HealthCheckCampaign, Long> {

    List<HealthCheckCampaign> findByCreatedBy(User nurse);

    List<HealthCheckCampaign> findByStatus(CampaignStatus status);

    List<HealthCheckCampaign> findByStatusIn(List<CampaignStatus> statuses);

    @Query("SELECT c FROM HealthCheckCampaign c WHERE c.status = :status AND c.startDate >= :startDate")
    List<HealthCheckCampaign> findUpcomingCampaigns(CampaignStatus status, LocalDate startDate);

    @Query("SELECT c FROM HealthCheckCampaign c WHERE c.status = :status AND c.endDate < :endDate")
    List<HealthCheckCampaign> findCompletedCampaigns(CampaignStatus status, LocalDate endDate);

    @Query("SELECT c FROM HealthCheckCampaign c WHERE :className MEMBER OF c.targetClasses AND c.status IN ('APPROVED', 'IN_PROGRESS')")
    List<HealthCheckCampaign> findActiveByClass(String className);

    // New method for scheduler service - find campaigns by status and end date before
    List<HealthCheckCampaign> findByStatusAndEndDateBefore(CampaignStatus status, LocalDate endDate);
}
