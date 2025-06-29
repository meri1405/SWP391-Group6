package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for requesting to refill expired medical supplies
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpiredSupplyRefillDTO {
    
    @NotNull(message = "ID vật tư y tế không được để trống")
    private Long medicalSupplyId;
    
    @NotNull(message = "Số lượng yêu cầu không được để trống")
    @DecimalMin(value = "0.001", message = "Số lượng yêu cầu phải lớn hơn 0")
    @Digits(integer = 15, fraction = 6, message = "Số lượng yêu cầu không hợp lệ")
    private BigDecimal requestedDisplayQuantity;
    
    @NotBlank(message = "Đơn vị yêu cầu không được để trống")
    private String requestedDisplayUnit;
    
    @NotNull(message = "Ngày hết hạn mới không được để trống")
    @Future(message = "Ngày hết hạn phải là ngày trong tương lai")
    private LocalDate newExpirationDate;
    
    private String notes;
} 