package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
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
public interface HealthCheckFormRepository extends JpaRepository<HealthCheckForm, Long> {
    
    List<HealthCheckForm> findByStatus(FormStatus status);
    
    List<HealthCheckForm> findByCampaign(HealthCheckCampaign campaign);
    
    List<HealthCheckForm> findByParent(User parent);
    
    List<HealthCheckForm> findByStudent(Student student);
    
    Optional<HealthCheckForm> findByCampaignAndStudent(HealthCheckCampaign campaign, Student student);
    
    List<HealthCheckForm> findByCampaignAndStatus(HealthCheckCampaign campaign, FormStatus status);
    
    List<HealthCheckForm> findByParentAndStatus(User parent, FormStatus status);
    
    @Query("SELECT hcf FROM HealthCheckForm hcf WHERE hcf.status = :status AND hcf.sentAt < :sentBefore")
    List<HealthCheckForm> findByStatusAndSentAtBefore(
        @Param("status") FormStatus status,
        @Param("sentBefore") LocalDateTime sentBefore
    );
    
    @Query("SELECT hcf FROM HealthCheckForm hcf WHERE " +
           "hcf.status = :status AND hcf.sentAt < :sentBefore AND " +
           "hcf.campaign.startDate < :campaignStartBefore")
    List<HealthCheckForm> findExpiredFormsForAutoDecline(
        @Param("status") FormStatus status,
        @Param("sentBefore") LocalDateTime sentBefore,
        @Param("campaignStartBefore") LocalDateTime campaignStartBefore
    );
    
    @Query("SELECT hcf FROM HealthCheckForm hcf WHERE hcf.parent = :parent ORDER BY hcf.sentAt DESC")
    Page<HealthCheckForm> findByParentOrderBySentAtDesc(
        @Param("parent") User parent,
        Pageable pageable
    );
    
    @Query("SELECT hcf FROM HealthCheckForm hcf WHERE hcf.campaign = :campaign ORDER BY hcf.sentAt DESC")
    Page<HealthCheckForm> findByCampaignOrderBySentAtDesc(
        @Param("campaign") HealthCheckCampaign campaign,
        Pageable pageable
    );
    
    @Query("SELECT COUNT(hcf) FROM HealthCheckForm hcf WHERE hcf.campaign = :campaign AND hcf.status = :status")
    long countByCampaignAndStatus(
        @Param("campaign") HealthCheckCampaign campaign,
        @Param("status") FormStatus status
    );
    
    @Query("SELECT COUNT(hcf) FROM HealthCheckForm hcf WHERE hcf.campaign = :campaign")
    long countByCampaign(@Param("campaign") HealthCheckCampaign campaign);
    
    @Query("SELECT hcf FROM HealthCheckForm hcf WHERE " +
           "hcf.status = :status AND hcf.reminderSent = false AND " +
           "hcf.sentAt < :reminderThreshold")
    List<HealthCheckForm> findFormsNeedingReminder(
        @Param("status") FormStatus status,
        @Param("reminderThreshold") LocalDateTime reminderThreshold
    );
}
