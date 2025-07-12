package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthCheckCampaignRepository extends JpaRepository<HealthCheckCampaign, Long> {
    
    List<HealthCheckCampaign> findByStatus(CampaignStatus status);
    
    List<HealthCheckCampaign> findByCreatedBy(User createdBy);
    
    List<HealthCheckCampaign> findByStatusAndEndDateBefore(CampaignStatus status, LocalDate endDate);
    
    List<HealthCheckCampaign> findByStatusAndStartDateAfter(CampaignStatus status, LocalDate startDate);
    
    @Query("SELECT hcc FROM HealthCheckCampaign hcc WHERE hcc.status = :status ORDER BY hcc.createdAt DESC")
    Page<HealthCheckCampaign> findByStatusOrderByCreatedAtDesc(
        @Param("status") CampaignStatus status, 
        Pageable pageable
    );
    
    @Query("SELECT hcc FROM HealthCheckCampaign hcc WHERE hcc.createdBy = :createdBy ORDER BY hcc.createdAt DESC")
    Page<HealthCheckCampaign> findByCreatedByOrderByCreatedAtDesc(
        @Param("createdBy") User createdBy, 
        Pageable pageable
    );
    
    @Query("SELECT hcc FROM HealthCheckCampaign hcc WHERE hcc.status = :status AND hcc.endDate < :endDate")
    List<HealthCheckCampaign> findExpiredCampaigns(
        @Param("status") CampaignStatus status,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT hcc FROM HealthCheckCampaign hcc WHERE " +
           "hcc.name LIKE %:keyword% OR hcc.description LIKE %:keyword% " +
           "ORDER BY hcc.createdAt DESC")
    Page<HealthCheckCampaign> searchByKeyword(
        @Param("keyword") String keyword,
        Pageable pageable
    );
    
    @Query("SELECT COUNT(hcc) FROM HealthCheckCampaign hcc WHERE hcc.status = :status")
    long countByStatus(@Param("status") CampaignStatus status);
    
    /**
     * Count health check campaigns created between two dates
     */
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Dashboard statistics methods
    long countByStatusAndCreatedAtBetween(CampaignStatus status, LocalDateTime start, LocalDateTime end);
}
