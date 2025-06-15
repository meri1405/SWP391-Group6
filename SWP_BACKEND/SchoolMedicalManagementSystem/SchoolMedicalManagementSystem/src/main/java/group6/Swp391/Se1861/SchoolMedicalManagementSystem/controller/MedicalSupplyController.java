package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-supplies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicalSupplyController {
    
    private final IMedicalSupplyService medicalSupplyService;
    
    @GetMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<MedicalSupplyDTO>> getAllMedicalSupplies() {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.getAllMedicalSupplies();
        return ResponseEntity.ok(supplies);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<MedicalSupplyDTO> getMedicalSupplyById(@PathVariable Long id) {
        return medicalSupplyService.getMedicalSupplyById(id)
                .map(supply -> ResponseEntity.ok(supply))
                .orElse(ResponseEntity.notFound().build());
    }
    
   

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<MedicalSupplyDTO>> getLowStockItems() {
        List<MedicalSupplyDTO> lowStockItems = medicalSupplyService.getLowStockItems();
        return ResponseEntity.ok(lowStockItems);
    }
    
    @GetMapping("/expiring-soon")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<MedicalSupplyDTO>> getExpiringSoonItems(
            @RequestParam(defaultValue = "30") int days) {
        List<MedicalSupplyDTO> expiringSoonItems = medicalSupplyService.getExpiringSoonItems(days);
        return ResponseEntity.ok(expiringSoonItems);
    }
    
    @GetMapping("/expired")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<MedicalSupplyDTO>> getExpiredItems() {
        List<MedicalSupplyDTO> expiredItems = medicalSupplyService.getExpiredItems();
        return ResponseEntity.ok(expiredItems);
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<MedicalSupplyDTO>> getSuppliesByCategory(@PathVariable String category) {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.getSuppliesByCategory(category);
        return ResponseEntity.ok(supplies);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<MedicalSupplyDTO>> searchSuppliesByName(@RequestParam String name) {
        List<MedicalSupplyDTO> supplies = medicalSupplyService.searchSuppliesByName(name);
        return ResponseEntity.ok(supplies);
    }
    
    @GetMapping("/location/{location}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
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
            medicalSupplyService.subtractStock(id, quantity);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
