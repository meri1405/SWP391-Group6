package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicalSupplyRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalSupplyService implements IMedicalSupplyService {
    
    private final MedicalSupplyRepository medicalSupplyRepository;
    
    @Override
    public List<MedicalSupplyDTO> getAllMedicalSupplies() {
        return medicalSupplyRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Optional<MedicalSupplyDTO> getMedicalSupplyById(Long id) {
        return medicalSupplyRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Override
    public MedicalSupplyDTO createMedicalSupply(MedicalSupplyDTO medicalSupplyDTO) {
        MedicalSupply medicalSupply = convertToEntity(medicalSupplyDTO);
        MedicalSupply savedSupply = medicalSupplyRepository.save(medicalSupply);
        return convertToDTO(savedSupply);
    }
    
    @Override
    public MedicalSupplyDTO updateMedicalSupply(Long id, MedicalSupplyDTO medicalSupplyDTO) {
        MedicalSupply existingSupply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical supply not found with id: " + id));
        
        existingSupply.setName(medicalSupplyDTO.getName());
        existingSupply.setCategory(medicalSupplyDTO.getCategory());
        existingSupply.setQuantity(medicalSupplyDTO.getQuantity());
        existingSupply.setUnit(medicalSupplyDTO.getUnit());
        existingSupply.setMinStockLevel(medicalSupplyDTO.getMinStockLevel());
        existingSupply.setExpirationDate(medicalSupplyDTO.getExpirationDate());
        existingSupply.setSupplier(medicalSupplyDTO.getSupplier());
        existingSupply.setLocation(medicalSupplyDTO.getLocation());
        existingSupply.setDescription(medicalSupplyDTO.getDescription());
        
        MedicalSupply updatedSupply = medicalSupplyRepository.save(existingSupply);
        return convertToDTO(updatedSupply);
    }
    
    @Override
    public void deleteMedicalSupply(Long id) {
        if (!medicalSupplyRepository.existsById(id)) {
            throw new RuntimeException("Medical supply not found with id: " + id);
        }
        medicalSupplyRepository.deleteById(id);
    }
    
    @Override
    public List<MedicalSupplyDTO> getLowStockItems() {
        return medicalSupplyRepository.findLowStockItems()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MedicalSupplyDTO> getExpiringSoonItems(int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return medicalSupplyRepository.findExpiringSoon(thresholdDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MedicalSupplyDTO> getExpiredItems() {
        return medicalSupplyRepository.findExpiredItems()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MedicalSupplyDTO> getSuppliesByCategory(String category) {
        return medicalSupplyRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MedicalSupplyDTO> searchSuppliesByName(String name) {
        return medicalSupplyRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MedicalSupplyDTO> getSuppliesByLocation(String location) {
        return medicalSupplyRepository.findByLocation(location)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public void updateStock(Long id, Integer quantity) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical supply not found with id: " + id));
        supply.setQuantity(quantity);
        medicalSupplyRepository.save(supply);
    }
    
    @Override
    public void addStock(Long id, Integer quantity) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical supply not found with id: " + id));
        supply.setQuantity(supply.getQuantity() + quantity);
        medicalSupplyRepository.save(supply);
    }
    
    @Override
    public void subtractStock(Long id, Integer quantity) {
        MedicalSupply supply = medicalSupplyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical supply not found with id: " + id));
        int newQuantity = supply.getQuantity() - quantity;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock. Current quantity: " + supply.getQuantity());
        }
        supply.setQuantity(newQuantity);
        medicalSupplyRepository.save(supply);
    }
    
    @Override
    public long getLowStockCount() {
        return medicalSupplyRepository.countLowStockItems();
    }
    
    @Override
    public long getExpiringSoonCount(int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return medicalSupplyRepository.countExpiringSoon(thresholdDate);
    }
    
    @Override
    public MedicalSupplyDTO convertToDTO(MedicalSupply medicalSupply) {
        MedicalSupplyDTO dto = new MedicalSupplyDTO();
        dto.setId(medicalSupply.getId());
        dto.setName(medicalSupply.getName());
        dto.setCategory(medicalSupply.getCategory());
        dto.setQuantity(medicalSupply.getQuantity());
        dto.setUnit(medicalSupply.getUnit());
        dto.setMinStockLevel(medicalSupply.getMinStockLevel());
        dto.setExpirationDate(medicalSupply.getExpirationDate());
        dto.setSupplier(medicalSupply.getSupplier());
        dto.setLocation(medicalSupply.getLocation());
        dto.setDescription(medicalSupply.getDescription());
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
        medicalSupply.setQuantity(dto.getQuantity());
        medicalSupply.setUnit(dto.getUnit());
        medicalSupply.setMinStockLevel(dto.getMinStockLevel());
        medicalSupply.setExpirationDate(dto.getExpirationDate());
        medicalSupply.setSupplier(dto.getSupplier());
        medicalSupply.setLocation(dto.getLocation());
        medicalSupply.setDescription(dto.getDescription());
        return medicalSupply;
    }
}
