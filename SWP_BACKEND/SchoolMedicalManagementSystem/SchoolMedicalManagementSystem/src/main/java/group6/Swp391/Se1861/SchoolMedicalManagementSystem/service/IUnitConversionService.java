package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UnitConversionDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface IUnitConversionService {
    
    List<UnitConversionDTO> getAllUnitConversions();
    
    List<UnitConversionDTO> getEnabledUnitConversions();
    
    Optional<UnitConversionDTO> getUnitConversionById(Long id);
    
    UnitConversionDTO createUnitConversion(UnitConversionDTO unitConversionDTO);
    
    UnitConversionDTO updateUnitConversion(Long id, UnitConversionDTO unitConversionDTO);
    
    void deleteUnitConversion(Long id);
    
    void enableUnitConversion(Long id);
    
    void disableUnitConversion(Long id);
    
    BigDecimal convertQuantity(BigDecimal quantity, String fromUnit, String toUnit);
    
    BigDecimal convertToBaseUnit(BigDecimal quantity, String fromUnit, String baseUnit);
    
    BigDecimal convertFromBaseUnit(BigDecimal quantity, String baseUnit, String toUnit);
    
    List<String> getAllAvailableUnits();
    
    List<String> getConvertibleUnits(String fromUnit);
    
    List<UnitConversionDTO> getConversionsForUnit(String unit);
    
    boolean canConvert(String fromUnit, String toUnit);
    
    void seedDefaultConversions();
}
