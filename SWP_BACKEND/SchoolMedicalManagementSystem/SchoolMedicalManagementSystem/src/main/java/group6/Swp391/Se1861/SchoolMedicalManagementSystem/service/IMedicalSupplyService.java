package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IMedicalSupplyService {
    
    List<MedicalSupplyDTO> getAllMedicalSupplies();
    
    Optional<MedicalSupplyDTO> getMedicalSupplyById(Long id);
    
    MedicalSupplyDTO createMedicalSupply(MedicalSupplyDTO medicalSupplyDTO);
    
    MedicalSupplyDTO updateMedicalSupply(Long id, MedicalSupplyDTO medicalSupplyDTO);
    
    void deleteMedicalSupply(Long id);
    
    List<MedicalSupplyDTO> getLowStockItems();
    
    List<MedicalSupplyDTO> getExpiringSoonItems(int daysThreshold);
    
    List<MedicalSupplyDTO> getExpiredItems();
    
    List<MedicalSupplyDTO> getSuppliesByCategory(String category);
    
    List<MedicalSupplyDTO> searchSuppliesByName(String name);
    
    List<MedicalSupplyDTO> getSuppliesByLocation(String location);
    
    void updateStock(Long id, Integer quantity);
    
    void addStock(Long id, Integer quantity);
    
    void subtractStock(Long id, Integer quantity);
    
    long getLowStockCount();
    
    long getExpiringSoonCount(int daysThreshold);
    
    MedicalSupplyDTO convertToDTO(MedicalSupply medicalSupply);
    
    MedicalSupply convertToEntity(MedicalSupplyDTO medicalSupplyDTO);
}
