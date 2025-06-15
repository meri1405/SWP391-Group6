package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicalSupplyRepository extends JpaRepository<MedicalSupply, Long> {
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.quantity <= m.minStockLevel")
    List<MedicalSupply> findLowStockItems();
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.expirationDate <= :date")
    List<MedicalSupply> findExpiringSoon(@Param("date") LocalDate date);
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.expirationDate < CURRENT_DATE")
    List<MedicalSupply> findExpiredItems();
    
    List<MedicalSupply> findByCategory(String category);
    
    @Query("SELECT m FROM MedicalSupply m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<MedicalSupply> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.location = :location")
    List<MedicalSupply> findByLocation(@Param("location") String location);
    
    @Query("SELECT COUNT(m) FROM MedicalSupply m WHERE m.quantity <= m.minStockLevel")
    long countLowStockItems();
    
    @Query("SELECT COUNT(m) FROM MedicalSupply m WHERE m.expirationDate <= :date")
    long countExpiringSoon(@Param("date") LocalDate date);
}
