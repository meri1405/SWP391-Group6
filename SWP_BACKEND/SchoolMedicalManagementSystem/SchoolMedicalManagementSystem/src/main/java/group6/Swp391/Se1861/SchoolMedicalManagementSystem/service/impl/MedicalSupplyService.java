package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicalSupplyRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUnitConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MedicalSupplyService implements IMedicalSupplyService {
    
    private final MedicalSupplyRepository medicalSupplyRepository;
    private final IUnitConversionService unitConversionService;
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getAllMedicalSupplies() {
        return medicalSupplyRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getEnabledMedicalSupplies() {
        return medicalSupplyRepository.findByEnabled(true)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<MedicalSupplyDTO> getMedicalSupplyById(Long id) {
        return medicalSupplyRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Override
    public MedicalSupplyDTO createMedicalSupply(MedicalSupplyDTO medicalSupplyDTO) {
        MedicalSupply medicalSupply = convertToEntity(medicalSupplyDTO);
        
        // Convert display quantity to base unit if needed
        if (!medicalSupply.getDisplayUnit().equals(medicalSupply.getBaseUnit())) {
            BigDecimal quantityInBaseUnit = unitConversionService.convertToBaseUnit(
                    medicalSupply.getDisplayQuantity(), 
                    medicalSupply.getDisplayUnit(), 
                    medicalSupply.getBaseUnit());
            medicalSupply.setQuantityInBaseUnit(quantityInBaseUnit);
        } else {
            medicalSupply.setQuantityInBaseUnit(medicalSupply.getDisplayQuantity());
        }
        
        MedicalSupply savedSupply = medicalSupplyRepository.save(medicalSupply);
        log.info("Created medical supply: {} with quantity {} {}", 
                savedSupply.getName(), savedSupply.getDisplayQuantity(), savedSupply.getDisplayUnit());
        return convertToDTO(savedSupply);
    }
    
    @Override
    public MedicalSupplyDTO updateMedicalSupply(Long id, MedicalSupplyDTO medicalSupplyDTO) {
        MedicalSupply existingSupply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        
        existingSupply.setName(medicalSupplyDTO.getName());
        existingSupply.setCategory(medicalSupplyDTO.getCategory());
        existingSupply.setDisplayQuantity(medicalSupplyDTO.getDisplayQuantity());
        existingSupply.setDisplayUnit(medicalSupplyDTO.getDisplayUnit());
        existingSupply.setBaseUnit(medicalSupplyDTO.getBaseUnit());
        existingSupply.setMinStockLevelInBaseUnit(medicalSupplyDTO.getMinStockLevelInBaseUnit());
        existingSupply.setExpirationDate(medicalSupplyDTO.getExpirationDate());
        existingSupply.setSupplier(medicalSupplyDTO.getSupplier());
        existingSupply.setLocation(medicalSupplyDTO.getLocation());
        existingSupply.setDescription(medicalSupplyDTO.getDescription());
        
        // Recalculate base unit quantity if display unit changed
        if (!existingSupply.getDisplayUnit().equals(existingSupply.getBaseUnit())) {
            BigDecimal quantityInBaseUnit = unitConversionService.convertToBaseUnit(
                    existingSupply.getDisplayQuantity(), 
                    existingSupply.getDisplayUnit(), 
                    existingSupply.getBaseUnit());
            existingSupply.setQuantityInBaseUnit(quantityInBaseUnit);
        } else {
            existingSupply.setQuantityInBaseUnit(existingSupply.getDisplayQuantity());
        }
        
        MedicalSupply updatedSupply = medicalSupplyRepository.save(existingSupply);
        log.info("Updated medical supply ID {}: {}", id, updatedSupply.getName());
        return convertToDTO(updatedSupply);
    }
    
    @Override
    public void deleteMedicalSupply(Long id) {
        if (!medicalSupplyRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id);
        }
        medicalSupplyRepository.deleteById(id);
        log.info("Deleted medical supply with ID: {}", id);
    }
    
    @Override
    public void enableMedicalSupply(Long id) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        supply.setEnabled(true);
        medicalSupplyRepository.save(supply);
        log.info("Enabled medical supply ID: {}", id);
    }
    
    @Override
    public void disableMedicalSupply(Long id) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        supply.setEnabled(false);
        medicalSupplyRepository.save(supply);
        log.info("Disabled medical supply ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getLowStockItems() {
        return medicalSupplyRepository.findLowStockItems()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getExpiringSoonItems(int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return medicalSupplyRepository.findExpiringSoon(thresholdDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getExpiredItems() {
        return medicalSupplyRepository.findExpiredItems()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getSuppliesByCategory(String category) {
        return medicalSupplyRepository.findByCategoryAndEnabled(category, true)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> searchSuppliesByName(String name) {
        return medicalSupplyRepository.findByNameContainingIgnoreCaseAndEnabled(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MedicalSupplyDTO> getSuppliesByLocation(String location) {
        return medicalSupplyRepository.findByLocationAndEnabled(location)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public void updateQuantityInBaseUnit(Long id, BigDecimal newQuantity) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        supply.updateQuantityInBaseUnit(newQuantity);
        
        // Update display quantity accordingly
        updateDisplayQuantityFromBaseUnit(supply);
        
        medicalSupplyRepository.save(supply);
        log.info("Updated quantity for supply ID {}: {} {}", id, newQuantity, supply.getBaseUnit());
    }
    
    @Override
    public void addToQuantityInBaseUnit(Long id, BigDecimal additionalQuantity) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        supply.addToQuantityInBaseUnit(additionalQuantity);
        
        // Update display quantity accordingly
        updateDisplayQuantityFromBaseUnit(supply);
        
        medicalSupplyRepository.save(supply);
        log.info("Added {} {} to supply ID {}", additionalQuantity, supply.getBaseUnit(), id);
    }
    
    @Override
    public void subtractFromQuantityInBaseUnit(Long id, BigDecimal subtractQuantity) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        
        if (supply.getQuantityInBaseUnit().compareTo(subtractQuantity) < 0) {
            throw new RuntimeException("Không đủ tồn kho. Số lượng hiện tại: " + supply.getQuantityInBaseUnit() + " " + supply.getBaseUnit());
        }
        
        supply.subtractFromQuantityInBaseUnit(subtractQuantity);
        
        // Update display quantity accordingly
        updateDisplayQuantityFromBaseUnit(supply);
        
        medicalSupplyRepository.save(supply);
        log.info("Subtracted {} {} from supply ID {}", subtractQuantity, supply.getBaseUnit(), id);
    }
    
    @Override
    public MedicalSupplyDTO updateDisplayQuantityAndUnit(Long id, BigDecimal displayQuantity, String displayUnit) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + id));
        
        supply.setDisplayQuantity(displayQuantity);
        supply.setDisplayUnit(displayUnit);
        
        // Convert to base unit
        if (!displayUnit.equals(supply.getBaseUnit())) {
            BigDecimal quantityInBaseUnit = unitConversionService.convertToBaseUnit(
                    displayQuantity, displayUnit, supply.getBaseUnit());
            supply.setQuantityInBaseUnit(quantityInBaseUnit);
        } else {
            supply.setQuantityInBaseUnit(displayQuantity);
        }
        
        MedicalSupply savedSupply = medicalSupplyRepository.save(supply);
        log.info("Updated display quantity for supply ID {}: {} {}", id, displayQuantity, displayUnit);
        return convertToDTO(savedSupply);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getLowStockCount() {
        return medicalSupplyRepository.countLowStockItems();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getExpiringSoonCount(int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return medicalSupplyRepository.countExpiringSoon(thresholdDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getExpiredCount() {
        return medicalSupplyRepository.countExpired();
    }
    
    private void updateDisplayQuantityFromBaseUnit(MedicalSupply supply) {
        if (!supply.getDisplayUnit().equals(supply.getBaseUnit())) {
            BigDecimal displayQuantity = unitConversionService.convertFromBaseUnit(
                    supply.getQuantityInBaseUnit(), 
                    supply.getBaseUnit(), 
                    supply.getDisplayUnit());
            supply.setDisplayQuantity(displayQuantity);
        } else {
            supply.setDisplayQuantity(supply.getQuantityInBaseUnit());
        }
    }
    
    @Override
    public MedicalSupplyDTO convertToDTO(MedicalSupply medicalSupply) {
        MedicalSupplyDTO dto = new MedicalSupplyDTO();
        dto.setId(medicalSupply.getId());
        dto.setName(medicalSupply.getName());
        dto.setCategory(medicalSupply.getCategory());
        dto.setQuantityInBaseUnit(medicalSupply.getQuantityInBaseUnit());
        dto.setBaseUnit(medicalSupply.getBaseUnit());
        dto.setDisplayQuantity(medicalSupply.getDisplayQuantity());
        dto.setDisplayUnit(medicalSupply.getDisplayUnit());
        dto.setMinStockLevelInBaseUnit(medicalSupply.getMinStockLevelInBaseUnit());
        dto.setExpirationDate(medicalSupply.getExpirationDate());
        dto.setSupplier(medicalSupply.getSupplier());
        dto.setLocation(medicalSupply.getLocation());
        dto.setDescription(medicalSupply.getDescription());
        dto.setEnabled(medicalSupply.getEnabled());
        dto.setCreatedAt(medicalSupply.getCreatedAt());
        dto.setUpdatedAt(medicalSupply.getUpdatedAt());
        dto.setIsLowStock(medicalSupply.isLowStock());
        dto.setIsExpiringSoon(medicalSupply.isExpiringSoon(30)); // 30 days threshold
        dto.setIsExpired(medicalSupply.isExpired());
        return dto;
    }
    
    @Override
    public MedicalSupply convertToEntity(MedicalSupplyDTO dto) {
        MedicalSupply medicalSupply = new MedicalSupply();
        medicalSupply.setId(dto.getId());
        medicalSupply.setName(dto.getName());
        medicalSupply.setCategory(dto.getCategory());
        medicalSupply.setQuantityInBaseUnit(dto.getQuantityInBaseUnit());
        medicalSupply.setBaseUnit(dto.getBaseUnit());
        medicalSupply.setDisplayQuantity(dto.getDisplayQuantity());
        medicalSupply.setDisplayUnit(dto.getDisplayUnit());
        medicalSupply.setMinStockLevelInBaseUnit(dto.getMinStockLevelInBaseUnit());
        medicalSupply.setExpirationDate(dto.getExpirationDate());
        medicalSupply.setSupplier(dto.getSupplier());
        medicalSupply.setLocation(dto.getLocation());
        medicalSupply.setDescription(dto.getDescription());
        medicalSupply.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        return medicalSupply;
    }
}
