package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Extended version of RestockItemDTO with additional fields for new supply requests and expired supply refills
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper=false)
public class ExtendedRestockItemDTO extends RestockItemDTO {
    
    // Type of request: "EXISTING", "EXPIRED", "NEW"
    private String requestType;
    
    // For new supply requests
    private String name;
    private String category;
    private String baseUnit;
    private String displayUnit;
    private BigDecimal minStockLevelInBaseUnit;
    private String supplier;
    private String location;
    private String description;
    
    // For expired supply refills
    @Future(message = "Ngày hết hạn phải là ngày trong tương lai")
    private LocalDate newExpirationDate;
    
    // Flag to indicate if the supply should be created in disabled state
    // (for new supplies, defaults to true until manager approves)
    private Boolean isDisabled = true;
    
    // Original supply ID for expired items (to link the replacement to the original)
    private Long originalSupplyId;
    
    // For recording who created the new supply
    private Long createdById;
} 