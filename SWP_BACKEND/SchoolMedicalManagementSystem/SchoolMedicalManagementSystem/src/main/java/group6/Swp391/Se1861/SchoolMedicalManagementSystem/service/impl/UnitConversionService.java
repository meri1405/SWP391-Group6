package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UnitConversionDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.UnitConversion;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UnitConversionRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUnitConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UnitConversionService implements IUnitConversionService {
    
    private final UnitConversionRepository unitConversionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<UnitConversionDTO> getAllUnitConversions() {
        return unitConversionRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UnitConversionDTO> getEnabledUnitConversions() {
        return unitConversionRepository.findByEnabled(true)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UnitConversionDTO> getUnitConversionById(Long id) {
        return unitConversionRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Override
    public UnitConversionDTO createUnitConversion(UnitConversionDTO unitConversionDTO) {
        // Check if conversion already exists
        if (unitConversionRepository.existsByFromUnitAndToUnit(
                unitConversionDTO.getFromUnit(), unitConversionDTO.getToUnit())) {
            throw new RuntimeException("Chuyển đổi đơn vị đã tồn tại");
        }
        
        UnitConversion unitConversion = convertToEntity(unitConversionDTO);
        UnitConversion savedConversion = unitConversionRepository.save(unitConversion);
        log.info("Created unit conversion: {} -> {} with multiplier {}", 
                savedConversion.getFromUnit(), savedConversion.getToUnit(), savedConversion.getMultiplier());
        return convertToDTO(savedConversion);
    }
    
    @Override
    public UnitConversionDTO updateUnitConversion(Long id, UnitConversionDTO unitConversionDTO) {
        UnitConversion existingConversion = unitConversionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyển đổi đơn vị với ID: " + id));
        
        existingConversion.setFromUnit(unitConversionDTO.getFromUnit());
        existingConversion.setToUnit(unitConversionDTO.getToUnit());
        existingConversion.setMultiplier(unitConversionDTO.getMultiplier());
        existingConversion.setDescription(unitConversionDTO.getDescription());
        
        UnitConversion savedConversion = unitConversionRepository.save(existingConversion);
        log.info("Updated unit conversion ID {}: {} -> {} with multiplier {}", 
                id, savedConversion.getFromUnit(), savedConversion.getToUnit(), savedConversion.getMultiplier());
        return convertToDTO(savedConversion);
    }
    
    @Override
    public void deleteUnitConversion(Long id) {
        if (!unitConversionRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy chuyển đổi đơn vị với ID: " + id);
        }
        unitConversionRepository.deleteById(id);
        log.info("Deleted unit conversion with ID: {}", id);
    }
    
    @Override
    public void enableUnitConversion(Long id) {
        UnitConversion conversion = unitConversionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyển đổi đơn vị với ID: " + id));
        conversion.setEnabled(true);
        unitConversionRepository.save(conversion);
        log.info("Enabled unit conversion ID: {}", id);
    }
    
    @Override
    public void disableUnitConversion(Long id) {
        UnitConversion conversion = unitConversionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyển đổi đơn vị với ID: " + id));
        conversion.setEnabled(false);
        unitConversionRepository.save(conversion);
        log.info("Disabled unit conversion ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal convertQuantity(BigDecimal quantity, String fromUnit, String toUnit) {
        if (fromUnit.equals(toUnit)) {
            return quantity;
        }
        
        Optional<UnitConversion> conversionOpt = unitConversionRepository
                .findByFromUnitAndToUnitAndEnabled(fromUnit, toUnit, true);
        
        if (conversionOpt.isPresent()) {
            return quantity.multiply(conversionOpt.get().getMultiplier())
                    .setScale(6, RoundingMode.HALF_UP);
        }
        
        // Try reverse conversion
        Optional<UnitConversion> reverseConversionOpt = unitConversionRepository
                .findByFromUnitAndToUnitAndEnabled(toUnit, fromUnit, true);
        
        if (reverseConversionOpt.isPresent()) {
            return quantity.divide(reverseConversionOpt.get().getMultiplier(), 6, RoundingMode.HALF_UP);
        }
        
        throw new RuntimeException(String.format("Không thể chuyển đổi từ đơn vị '%s' sang '%s'", fromUnit, toUnit));
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal convertToBaseUnit(BigDecimal quantity, String fromUnit, String baseUnit) {
        return convertQuantity(quantity, fromUnit, baseUnit);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal convertFromBaseUnit(BigDecimal quantity, String baseUnit, String toUnit) {
        return convertQuantity(quantity, baseUnit, toUnit);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllAvailableUnits() {
        return unitConversionRepository.findAllDistinctUnits();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getConvertibleUnits(String fromUnit) {
        Set<String> convertibleUnits = new HashSet<>();
        
        // Find direct conversions FROM the unit
        List<UnitConversion> directConversions = unitConversionRepository.findByFromUnitAndEnabled(fromUnit, true);
        directConversions.forEach(conversion -> convertibleUnits.add(conversion.getToUnit()));
        
        // Find reverse conversions TO the unit (where fromUnit is the target)
        List<UnitConversion> reverseConversions = unitConversionRepository.findByToUnitAndEnabled(fromUnit, true);
        reverseConversions.forEach(conversion -> convertibleUnits.add(conversion.getFromUnit()));
        
        // Include the unit itself (same unit conversion)
        convertibleUnits.add(fromUnit);
        
        return convertibleUnits.stream()
                .sorted()
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UnitConversionDTO> getConversionsForUnit(String unit) {
        return unitConversionRepository.findAllConversionsForUnit(unit)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canConvert(String fromUnit, String toUnit) {
        if (fromUnit.equals(toUnit)) {
            return true;
        }
        
        return unitConversionRepository.findByFromUnitAndToUnitAndEnabled(fromUnit, toUnit, true).isPresent() ||
               unitConversionRepository.findByFromUnitAndToUnitAndEnabled(toUnit, fromUnit, true).isPresent();
    }
    
    @Override
    public void seedDefaultConversions() {
        log.info("Seeding default unit conversions...");
        
        // Medicine units
        createConversionIfNotExists("LÔ", "HỘP", new BigDecimal("10"), "1 Lô = 10 Hộp");
        createConversionIfNotExists("HỘP", "VIÊN", new BigDecimal("10"), "1 Hộp = 10 Viên");
        createConversionIfNotExists("HỘP", "GÓI", new BigDecimal("1"), "1 Hộp = 1 Gói");
        createConversionIfNotExists("LÔ", "VIÊN", new BigDecimal("100"), "1 Lô = 100 Viên");
        
        // Volume units  
        createConversionIfNotExists("LITER", "ML", new BigDecimal("1000"), "1 Liter = 1000 ML");
        createConversionIfNotExists("CHAI", "ML", new BigDecimal("500"), "1 Chai = 500 ML");
        
        // Weight units
        createConversionIfNotExists("KG", "GRAM", new BigDecimal("1000"), "1 KG = 1000 Gram");
        createConversionIfNotExists("THÙNG", "KG", new BigDecimal("20"), "1 Thùng = 20 KG");
        
        // Medical supply units
        createConversionIfNotExists("THÙNG", "CUỘN", new BigDecimal("50"), "1 Thùng = 50 Cuộn băng");
        createConversionIfNotExists("THÙNG", "CÁI", new BigDecimal("100"), "1 Thùng = 100 Cái");
        createConversionIfNotExists("GÓI", "CÁI", new BigDecimal("10"), "1 Gói = 10 Cái");
        
        log.info("Default unit conversions seeded successfully");
    }
    
    private void createConversionIfNotExists(String fromUnit, String toUnit, BigDecimal multiplier, String description) {
        if (!unitConversionRepository.existsByFromUnitAndToUnit(fromUnit, toUnit)) {
            UnitConversion conversion = new UnitConversion(fromUnit, toUnit, multiplier, description);
            unitConversionRepository.save(conversion);
            log.debug("Created conversion: {} -> {} ({})", fromUnit, toUnit, multiplier);
        }
    }
    
    private UnitConversionDTO convertToDTO(UnitConversion unitConversion) {
        UnitConversionDTO dto = new UnitConversionDTO();
        dto.setId(unitConversion.getId());
        dto.setFromUnit(unitConversion.getFromUnit());
        dto.setToUnit(unitConversion.getToUnit());
        dto.setMultiplier(unitConversion.getMultiplier());
        dto.setDescription(unitConversion.getDescription());
        dto.setEnabled(unitConversion.getEnabled());
        dto.setCreatedAt(unitConversion.getCreatedAt());
        dto.setUpdatedAt(unitConversion.getUpdatedAt());
        return dto;
    }
    
    private UnitConversion convertToEntity(UnitConversionDTO dto) {
        UnitConversion conversion = new UnitConversion();
        conversion.setFromUnit(dto.getFromUnit());
        conversion.setToUnit(dto.getToUnit());
        conversion.setMultiplier(dto.getMultiplier());
        conversion.setDescription(dto.getDescription());
        conversion.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        return conversion;
    }
}
