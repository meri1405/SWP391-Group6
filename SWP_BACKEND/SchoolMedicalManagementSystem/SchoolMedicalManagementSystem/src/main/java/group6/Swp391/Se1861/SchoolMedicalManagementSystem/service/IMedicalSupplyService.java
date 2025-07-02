package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IMedicalSupplyService {
    
    List<MedicalSupplyDTO> getAllMedicalSupplies();
    
    List<MedicalSupplyDTO> getEnabledMedicalSupplies();
    
    Optional<MedicalSupplyDTO> getMedicalSupplyById(Long id);
    
    MedicalSupplyDTO createMedicalSupply(MedicalSupplyDTO medicalSupplyDTO);
    
    MedicalSupplyDTO createDisabledMedicalSupply(MedicalSupplyDTO medicalSupplyDTO, Long createdBy);
    
    MedicalSupplyDTO duplicateExpiredSupply(Long originalSupplyId, LocalDate newExpirationDate, Long createdBy);
    
    MedicalSupplyDTO updateMedicalSupply(Long id, MedicalSupplyDTO medicalSupplyDTO);
    
    void enableMedicalSupply(Long id);
    
    void disableMedicalSupply(Long id);
    
    List<MedicalSupplyDTO> getLowStockItems();
    
    List<MedicalSupplyDTO> getExpiringSoonItems(int daysThreshold);
    
    List<MedicalSupplyDTO> getExpiredItems();
    
    List<MedicalSupplyDTO> getSuppliesByCategory(String category);
    
    List<MedicalSupplyDTO> searchSuppliesByName(String name);
    
    List<MedicalSupplyDTO> getSuppliesByLocation(String location);
    
    void updateQuantityInBaseUnit(Long id, BigDecimal newQuantity);
    
    void addToQuantityInBaseUnit(Long id, BigDecimal additionalQuantity);
    
    void subtractFromQuantityInBaseUnit(Long id, BigDecimal subtractQuantity);
    
    MedicalSupplyDTO updateDisplayQuantityAndUnit(Long id, BigDecimal displayQuantity, String displayUnit);
    
    long getLowStockCount();
    
    long getExpiringSoonCount(int daysThreshold);
    
    long getExpiredCount();
    
    MedicalSupplyDTO convertToDTO(MedicalSupply medicalSupply);
    
    MedicalSupply convertToEntity(MedicalSupplyDTO medicalSupplyDTO);
}
