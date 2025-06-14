package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestockItemDTO {
    private Long id;
    private Long restockRequestId;
    private Long medicalSupplyId;
    private String medicalSupplyName;
    private String category;
    private String unit;
    private Integer currentStock;
    private Integer minStockLevel;
    private Integer requestedQuantity;
    private Integer approvedQuantity;
    private String notes;
}
