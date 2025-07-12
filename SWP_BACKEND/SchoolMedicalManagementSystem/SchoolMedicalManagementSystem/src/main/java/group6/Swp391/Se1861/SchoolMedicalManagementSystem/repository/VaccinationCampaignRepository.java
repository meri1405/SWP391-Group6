package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationRule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationCampaignRepository extends JpaRepository<VaccinationCampaign, Long> {
    
    List<VaccinationCampaign> findByStatus(VaccinationCampaign.CampaignStatus status);
    
    List<VaccinationCampaign> findByCreatedBy(User createdBy);
    
    List<VaccinationCampaign> findByVaccinationRule(VaccinationRule vaccinationRule);
    
    List<VaccinationCampaign> findByStatusAndScheduledDateAfter(
        VaccinationCampaign.CampaignStatus status, 
        LocalDateTime date
    );
    
    @Query("SELECT vc FROM VaccinationCampaign vc WHERE vc.status = :status ORDER BY vc.createdDate DESC")
    Page<VaccinationCampaign> findByStatusOrderByCreatedDateDesc(
        @Param("status") VaccinationCampaign.CampaignStatus status, 
        Pageable pageable
    );
    
    @Query("SELECT vc FROM VaccinationCampaign vc WHERE vc.createdBy = :createdBy ORDER BY vc.createdDate DESC")
    Page<VaccinationCampaign> findByCreatedByOrderByCreatedDateDesc(
        @Param("createdBy") User createdBy, 
        Pageable pageable
    );
    
    boolean existsByNameAndStatus(String name, VaccinationCampaign.CampaignStatus status);

    // Dashboard statistics methods
    long countByStatus(VaccinationCampaign.CampaignStatus status);
    long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);
    long countByStatusAndCreatedDateBetween(VaccinationCampaign.CampaignStatus status, LocalDateTime start, LocalDateTime end);
}
