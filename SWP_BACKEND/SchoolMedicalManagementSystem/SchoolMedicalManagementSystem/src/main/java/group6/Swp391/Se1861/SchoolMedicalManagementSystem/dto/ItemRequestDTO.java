package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemRequestDTO {

    private Long id;

    @NotBlank(message = "Item name is required")
    @Size(max = 100, message = "Item name cannot exceed 100 characters")
    private String itemName;

    @NotBlank(message = "Purpose is required")
    @Size(max = 200, message = "Purpose cannot exceed 200 characters")
    private String purpose;

    @NotBlank(message = "Item type is required")
    private String itemType; // PRESCRIPTION, OTC, SUPPLEMENT

    @NotNull(message = "Dosage is required")
    @Min(value = 1, message = "Dosage must be at least 1")
    private Integer dosage;

    @NotNull(message = "Frequency is required")
    @Min(value = 1, message = "Frequency must be at least 1")
    private Integer frequency;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Note is required")
    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;
}
