package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UnitConversionDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUnitConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unit-conversions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UnitConversionController {
    
    private final IUnitConversionService unitConversionService;
    
    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<UnitConversionDTO>> getAllUnitConversions() {
        try {
            List<UnitConversionDTO> conversions = unitConversionService.getAllUnitConversions();
            return ResponseEntity.ok(conversions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/enabled")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<UnitConversionDTO>> getEnabledUnitConversions() {
        try {
            List<UnitConversionDTO> conversions = unitConversionService.getEnabledUnitConversions();
            return ResponseEntity.ok(conversions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/units")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<String>> getAllAvailableUnits() {
        try {
            List<String> units = unitConversionService.getAllAvailableUnits();
            return ResponseEntity.ok(units);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/convertible-units/{fromUnit}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<String>> getConvertibleUnits(@PathVariable String fromUnit) {
        try {
            List<String> convertibleUnits = unitConversionService.getConvertibleUnits(fromUnit);
            return ResponseEntity.ok(convertibleUnits);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<UnitConversionDTO> getUnitConversionById(@PathVariable Long id) {
        try {
            return unitConversionService.getUnitConversionById(id)
                    .map(conversion -> ResponseEntity.ok(conversion))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<UnitConversionDTO> createUnitConversion(@Valid @RequestBody UnitConversionDTO unitConversionDTO) {
        try {
            UnitConversionDTO createdConversion = unitConversionService.createUnitConversion(unitConversionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdConversion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<UnitConversionDTO> updateUnitConversion(
            @PathVariable Long id, 
            @Valid @RequestBody UnitConversionDTO unitConversionDTO) {
        try {
            UnitConversionDTO updatedConversion = unitConversionService.updateUnitConversion(id, unitConversionDTO);
            return ResponseEntity.ok(updatedConversion);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> deleteUnitConversion(@PathVariable Long id) {
        try {
            unitConversionService.deleteUnitConversion(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> enableUnitConversion(@PathVariable Long id) {
        try {
            unitConversionService.enableUnitConversion(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> disableUnitConversion(@PathVariable Long id) {
        try {
            unitConversionService.disableUnitConversion(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/convert")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> convertQuantity(@RequestBody Map<String, Object> request) {
        try {
            BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
            String fromUnit = request.get("fromUnit").toString();
            String toUnit = request.get("toUnit").toString();
            
            BigDecimal convertedQuantity = unitConversionService.convertQuantity(quantity, fromUnit, toUnit);
            
            Map<String, Object> response = Map.of(
                    "originalQuantity", quantity,
                    "originalUnit", fromUnit,
                    "convertedQuantity", convertedQuantity,
                    "convertedUnit", toUnit
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/for-unit/{unit}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<UnitConversionDTO>> getConversionsForUnit(@PathVariable String unit) {
        try {
            List<UnitConversionDTO> conversions = unitConversionService.getConversionsForUnit(unit);
            return ResponseEntity.ok(conversions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/can-convert")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Boolean>> canConvert(
            @RequestParam String fromUnit, 
            @RequestParam String toUnit) {
        try {
            boolean canConvert = unitConversionService.canConvert(fromUnit, toUnit);
            return ResponseEntity.ok(Map.of("canConvert", canConvert));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/seed-defaults")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Map<String, String>> seedDefaultConversions() {
        try {
            unitConversionService.seedDefaultConversions();
            return ResponseEntity.ok(Map.of("message", "Default unit conversions seeded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to seed default conversions"));
        }
    }
}
