package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalSupplyDTO {
    private Long id;
    private String name;
    private String category;
    private Integer quantity;
    private String unit;
    private Integer minStockLevel;
    private LocalDate expirationDate;
    private String supplier;
    private String location;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isLowStock;
    private Boolean isExpiringSoon;
    private Boolean isExpired;
}
