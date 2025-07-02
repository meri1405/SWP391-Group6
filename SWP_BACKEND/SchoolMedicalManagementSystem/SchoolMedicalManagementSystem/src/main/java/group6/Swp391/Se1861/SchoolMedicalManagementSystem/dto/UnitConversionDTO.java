package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitConversionDTO {
    private Long id;
    
    @NotBlank(message = "Đơn vị nguồn không được để trống")
    @Size(max = 50, message = "Đơn vị nguồn không được vượt quá 50 ký tự")
    private String fromUnit;
    
    @NotBlank(message = "Đơn vị đích không được để trống")
    @Size(max = 50, message = "Đơn vị đích không được vượt quá 50 ký tự")
    private String toUnit;
    
    @NotNull(message = "Hệ số chuyển đổi không được để trống")
    @DecimalMin(value = "0.000001", message = "Hệ số chuyển đổi phải lớn hơn 0")
    @Digits(integer = 15, fraction = 6, message = "Hệ số chuyển đổi không hợp lệ")
    private BigDecimal multiplier;
    
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
    
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
