package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationHistory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationHistoryRepository extends JpaRepository<VaccinationHistory, Long> {
    
    List<VaccinationHistory> findByHealthProfile(HealthProfile healthProfile);
    
    @Query("SELECT vh FROM VaccinationHistory vh WHERE vh.healthProfile.student = :student AND vh.vaccineName = :vaccineName ORDER BY vh.doseNumber")
    List<VaccinationHistory> findByHealthProfile_StudentAndVaccineName(
        @Param("student") Student student, 
        @Param("vaccineName") String vaccineName
    );
    
    @Query("SELECT vh FROM VaccinationHistory vh WHERE vh.healthProfile = :healthProfile AND vh.vaccineName = :vaccineName AND vh.doseNumber = :doseNumber")
    List<VaccinationHistory> findByHealthProfileAndVaccineNameAndDoseNumber(
        @Param("healthProfile") HealthProfile healthProfile,
        @Param("vaccineName") String vaccineName,
        @Param("doseNumber") Integer doseNumber
    );
    
    @Query("SELECT vh FROM VaccinationHistory vh WHERE vh.healthProfile.student = :student ORDER BY vh.dateOfVaccination DESC")
    List<VaccinationHistory> findByStudent(@Param("student") Student student);
}
