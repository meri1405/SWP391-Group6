package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.UnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface UnitConversionRepository extends JpaRepository<UnitConversion, Long> {
    
    Optional<UnitConversion> findByFromUnitAndToUnitAndEnabled(String fromUnit, String toUnit, Boolean enabled);
    
    List<UnitConversion> findByFromUnitAndEnabled(String fromUnit, Boolean enabled);
    
    List<UnitConversion> findByToUnitAndEnabled(String toUnit, Boolean enabled);
    
    List<UnitConversion> findByEnabled(Boolean enabled);
    
    @Query("SELECT uc FROM UnitConversion uc WHERE uc.fromUnit = :unit OR uc.toUnit = :unit AND uc.enabled = true")
    List<UnitConversion> findAllConversionsForUnit(@Param("unit") String unit);
    
    @Query("SELECT DISTINCT uc.fromUnit FROM UnitConversion uc WHERE uc.enabled = true " +
           "UNION SELECT DISTINCT uc.toUnit FROM UnitConversion uc WHERE uc.enabled = true")
    List<String> findAllDistinctUnits();
    
    boolean existsByFromUnitAndToUnit(String fromUnit, String toUnit);
}
