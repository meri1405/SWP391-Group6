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
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.quantityInBaseUnit <= m.minStockLevelInBaseUnit AND m.enabled = true")
    List<MedicalSupply> findLowStockItems();
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.expirationDate <= :date AND m.enabled = true")
    List<MedicalSupply> findExpiringSoon(@Param("date") LocalDate date);
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.expirationDate < CURRENT_DATE AND m.enabled = true")
    List<MedicalSupply> findExpiredItems();
    
    List<MedicalSupply> findByCategoryAndEnabled(String category, Boolean enabled);
    
    @Query("SELECT m FROM MedicalSupply m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')) AND m.enabled = true")
    List<MedicalSupply> findByNameContainingIgnoreCaseAndEnabled(@Param("name") String name);
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.name = :name AND m.enabled = true ORDER BY m.expirationDate ASC")
    List<MedicalSupply> findByNameAndEnabledOrderByExpirationDateAsc(@Param("name") String name);
    
    @Query("SELECT m FROM MedicalSupply m WHERE m.location = :location AND m.enabled = true")
    List<MedicalSupply> findByLocationAndEnabled(@Param("location") String location);
    
    List<MedicalSupply> findByEnabled(Boolean enabled);
    
    @Query("SELECT COUNT(m) FROM MedicalSupply m WHERE m.quantityInBaseUnit <= m.minStockLevelInBaseUnit AND m.enabled = true")
    long countLowStockItems();
    
    @Query("SELECT COUNT(m) FROM MedicalSupply m WHERE m.expirationDate <= :date AND m.enabled = true")
    long countExpiringSoon(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(m) FROM MedicalSupply m WHERE m.expirationDate < CURRENT_DATE AND m.enabled = true")
    long countExpired();
}
