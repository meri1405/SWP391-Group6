package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationFormRepository extends JpaRepository<VaccinationForm, Long> {
    
    List<VaccinationForm> findByCampaign(VaccinationCampaign campaign);
    
    List<VaccinationForm> findByStudent(Student student);
    
    List<VaccinationForm> findByParent(User parent);
    
    List<VaccinationForm> findByConfirmationStatus(VaccinationForm.ConfirmationStatus status);
    
    Optional<VaccinationForm> findByCampaignAndStudent(VaccinationCampaign campaign, Student student);
    
    @Query("SELECT vf FROM VaccinationForm vf WHERE vf.campaign = :campaign AND vf.confirmationStatus = :status")
    List<VaccinationForm> findByCampaignAndConfirmationStatus(
        @Param("campaign") VaccinationCampaign campaign,
        @Param("status") VaccinationForm.ConfirmationStatus status
    );
    
    @Query("SELECT vf FROM VaccinationForm vf WHERE vf.parent = :parent AND vf.confirmationStatus = :status")
    List<VaccinationForm> findByParentAndConfirmationStatus(
        @Param("parent") User parent,
        @Param("status") VaccinationForm.ConfirmationStatus status
    );
    
    boolean existsByCampaignAndStudent(VaccinationCampaign campaign, Student student);
    
    @Query("SELECT COUNT(vf) FROM VaccinationForm vf WHERE vf.campaign = :campaign AND vf.confirmationStatus = 'CONFIRMED'")
    Long countConfirmedFormsByCampaign(@Param("campaign") VaccinationCampaign campaign);
    
    List<VaccinationForm> findByConfirmationStatusAndSentDateIsNotNull(VaccinationForm.ConfirmationStatus status);
}
