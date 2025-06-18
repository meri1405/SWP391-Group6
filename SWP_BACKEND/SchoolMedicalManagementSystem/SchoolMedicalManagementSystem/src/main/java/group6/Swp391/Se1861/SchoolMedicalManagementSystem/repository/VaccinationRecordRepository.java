package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationRecord;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {
    
    List<VaccinationRecord> findByStudent(Student student);
    
    List<VaccinationRecord> findByCampaign(VaccinationCampaign campaign);
    
    List<VaccinationRecord> findByVaccinationRule(VaccinationRule vaccinationRule);
    
    List<VaccinationRecord> findBySource(VaccinationRecord.VaccinationSource source);
    
    @Query("SELECT vr FROM VaccinationRecord vr WHERE vr.student = :student AND vr.vaccineName = :vaccineName ORDER BY vr.doseNumber DESC")
    List<VaccinationRecord> findByStudentAndVaccineNameOrderByDoseNumberDesc(
        @Param("student") Student student,
        @Param("vaccineName") String vaccineName
    );
    
    @Query("SELECT vr FROM VaccinationRecord vr WHERE vr.student = :student AND vr.vaccineName = :vaccineName AND vr.doseNumber = :doseNumber")
    Optional<VaccinationRecord> findByStudentAndVaccineNameAndDoseNumber(
        @Param("student") Student student,
        @Param("vaccineName") String vaccineName,
        @Param("doseNumber") Integer doseNumber
    );
    
    @Query("SELECT MAX(vr.doseNumber) FROM VaccinationRecord vr WHERE vr.student = :student AND vr.vaccineName = :vaccineName")
    Optional<Integer> findMaxDoseNumberByStudentAndVaccineName(
        @Param("student") Student student,
        @Param("vaccineName") String vaccineName
    );
    
    @Query("SELECT vr FROM VaccinationRecord vr WHERE vr.medicalAttentionRequired = true AND vr.resolved = false")
    List<VaccinationRecord> findRecordsNeedingFollowUp();
    
    @Query("SELECT vr FROM VaccinationRecord vr WHERE vr.severityLevel IN ('SEVERE', 'CRITICAL')")
    List<VaccinationRecord> findSevereReactions();
    
    boolean existsByStudentAndCampaign(Student student, VaccinationCampaign campaign);
}
