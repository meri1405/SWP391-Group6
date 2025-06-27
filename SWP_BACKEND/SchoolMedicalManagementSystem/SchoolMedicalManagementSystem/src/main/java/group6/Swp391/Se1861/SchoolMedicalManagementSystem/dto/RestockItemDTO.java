package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestockItemDTO {
    private Long id;
    private Long restockRequestId;
    private Long medicalSupplyId;
    private String medicalSupplyName;
    private String category;
    
    // Current stock information
    private BigDecimal currentStockInBaseUnit;
    private String baseUnit;
    private BigDecimal currentDisplayQuantity;
    private String currentDisplayUnit;
    private BigDecimal minStockLevelInBaseUnit;
    
    // Requested quantities
    @NotNull(message = "Số lượng yêu cầu hiển thị không được để trống")
    @DecimalMin(value = "0.001", message = "Số lượng yêu cầu phải lớn hơn 0")
    @Digits(integer = 15, fraction = 6, message = "Số lượng yêu cầu không hợp lệ")
    private BigDecimal requestedDisplayQuantity;
    
    @NotBlank(message = "Đơn vị yêu cầu không được để trống")
    private String requestedDisplayUnit;
    
    private BigDecimal requestedQuantityInBaseUnit;
    
    // Approved quantities (set by manager)
    private BigDecimal approvedDisplayQuantity;
    private String approvedDisplayUnit;
    private BigDecimal approvedQuantityInBaseUnit;
    
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String notes;
}
