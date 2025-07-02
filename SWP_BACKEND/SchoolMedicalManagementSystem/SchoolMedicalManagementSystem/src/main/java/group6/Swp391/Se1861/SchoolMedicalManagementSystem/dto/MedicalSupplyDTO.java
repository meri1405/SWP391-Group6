package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalSupplyDTO {
    private Long id;
    
    @NotBlank(message = "Tên vật tư y tế không được để trống")
    @Size(max = 200, message = "Tên vật tư y tế không được vượt quá 200 ký tự")
    private String name;
    
    @NotBlank(message = "Danh mục không được để trống")
    @Size(max = 100, message = "Danh mục không được vượt quá 100 ký tự")
    private String category;
    
    @NotNull(message = "Số lượng trong đơn vị cơ sở không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số lượng phải lớn hơn hoặc bằng 0")
    @Digits(integer = 15, fraction = 6, message = "Số lượng không hợp lệ")
    private BigDecimal quantityInBaseUnit;
    
    @NotBlank(message = "Đơn vị cơ sở không được để trống")
    @Size(max = 50, message = "Đơn vị cơ sở không được vượt quá 50 ký tự")
    private String baseUnit;
    
    @NotNull(message = "Số lượng hiển thị không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số lượng hiển thị phải lớn hơn hoặc bằng 0")
    @Digits(integer = 15, fraction = 6, message = "Số lượng hiển thị không hợp lệ")
    private BigDecimal displayQuantity;
    
    @NotBlank(message = "Đơn vị hiển thị không được để trống")
    @Size(max = 50, message = "Đơn vị hiển thị không được vượt quá 50 ký tự")
    private String displayUnit;
    
    @NotNull(message = "Mức tồn kho tối thiểu không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Mức tồn kho tối thiểu phải lớn hơn hoặc bằng 0")
    @Digits(integer = 15, fraction = 6, message = "Mức tồn kho tối thiểu không hợp lệ")
    private BigDecimal minStockLevelInBaseUnit;
    
    // Expiration date is optional for non-medicine items
    private LocalDate expirationDate;
    
    @NotBlank(message = "Nhà cung cấp không được để trống")
    @Size(max = 200, message = "Nhà cung cấp không được vượt quá 200 ký tự")
    private String supplier;
    
    @Size(max = 200, message = "Vị trí không được vượt quá 200 ký tự")
    private String location;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Boolean isLowStock;
    private Boolean isExpiringSoon;
    private Boolean isExpired;
}
