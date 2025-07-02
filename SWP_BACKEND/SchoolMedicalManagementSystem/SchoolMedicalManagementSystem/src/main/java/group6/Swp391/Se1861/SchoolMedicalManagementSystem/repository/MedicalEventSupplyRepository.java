package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalEventSupply;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalEventSupplyRepository extends JpaRepository<MedicalEventSupply, Long> {

    List<MedicalEventSupply> findByMedicalEvent(MedicalEvent medicalEvent);

    List<MedicalEventSupply> findByMedicalSupply(MedicalSupply medicalSupply);

    @Query("SELECT mes FROM MedicalEventSupply mes JOIN mes.medicalEvent me WHERE me.occurrenceTime BETWEEN :startDate AND :endDate")
    List<MedicalEventSupply> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT SUM(mes.quantityUsed) FROM MedicalEventSupply mes WHERE mes.medicalSupply.id = :supplyId")
    Integer getTotalUsageBySupplyId(Long supplyId);

    @Query("SELECT SUM(mes.quantityUsed) FROM MedicalEventSupply mes " +
           "JOIN mes.medicalEvent me " +
           "WHERE mes.medicalSupply.id = :supplyId " +
           "AND me.occurrenceTime BETWEEN :startDate AND :endDate")
    Integer getTotalUsageBySupplyIdAndDateRange(Long supplyId, LocalDateTime startDate, LocalDateTime endDate);
}
