package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-supplies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicalSupplyController {
    
    private final IMedicalSupplyService medicalSupplyService;
    
    @GetMapping
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> getAllMedicalSupplies() {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.getAllMedicalSupplies();
        return ResponseEntity.ok(supplies);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<MedicalSupplyDTO> getMedicalSupplyById(@PathVariable Long id) {
        return medicalSupplyService.getMedicalSupplyById(id)
                .map(supply -> ResponseEntity.ok(supply))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<MedicalSupplyDTO> createMedicalSupply(@Valid @RequestBody MedicalSupplyDTO medicalSupplyDTO) {
        try {
            System.out.println("Received MedicalSupplyDTO: " + medicalSupplyDTO);
            MedicalSupplyDTO createdSupply = medicalSupplyService.createMedicalSupply(medicalSupplyDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSupply);
        } catch (Exception e) {
            System.err.println("Error creating medical supply: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<MedicalSupplyDTO> updateMedicalSupply(
            @PathVariable Long id, 
            @RequestBody MedicalSupplyDTO medicalSupplyDTO) {
        try {
            MedicalSupplyDTO updatedSupply = medicalSupplyService.updateMedicalSupply(id, medicalSupplyDTO);
            return ResponseEntity.ok(updatedSupply);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> enableMedicalSupply(@PathVariable Long id) {
        try {
            medicalSupplyService.enableMedicalSupply(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> disableMedicalSupply(@PathVariable Long id) {
        try {
            medicalSupplyService.disableMedicalSupply(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> getLowStockItems() {
        List<MedicalSupplyDTO> lowStockItems = medicalSupplyService.getLowStockItems();
        return ResponseEntity.ok(lowStockItems);
    }
    
    @GetMapping("/expiring-soon")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> getExpiringSoonItems(
            @RequestParam(defaultValue = "30") int days) {
        List<MedicalSupplyDTO> expiringSoonItems = medicalSupplyService.getExpiringSoonItems(days);
        return ResponseEntity.ok(expiringSoonItems);
    }
    
    @GetMapping("/expired")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> getExpiredItems() {
        List<MedicalSupplyDTO> expiredItems = medicalSupplyService.getExpiredItems();
        return ResponseEntity.ok(expiredItems);
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> getSuppliesByCategory(@PathVariable String category) {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.getSuppliesByCategory(category);
        return ResponseEntity.ok(supplies);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> searchSuppliesByName(@RequestParam String name) {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.searchSuppliesByName(name);
        return ResponseEntity.ok(supplies);
    }
    
    @GetMapping("/location/{location}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<MedicalSupplyDTO>> getSuppliesByLocation(@PathVariable String location) {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.getSuppliesByLocation(location);
        return ResponseEntity.ok(supplies);
    }
    
    
    @PutMapping("/{id}/subtract-stock")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> subtractStock(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> stockUpdate) {
        try {
            Integer quantity = stockUpdate.get("quantity");
            if (quantity == null || quantity <= 0) {
                return ResponseEntity.badRequest().build();
            }
            medicalSupplyService.subtractFromQuantityInBaseUnit(id, BigDecimal.valueOf(quantity));
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
