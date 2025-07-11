package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

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
    private String itemType; // PRESCRIPTION, OTC, SUPPLEMENT    @NotNull(message = "Dosage is required")
    @DecimalMin(value = "0.1", message = "Dosage must be at least 0.1")
    private Double dosage;

    @NotNull(message = "Frequency is required")
    @Min(value = 0, message = "Frequency must be at least 0.1")
    private Integer frequency;

    @NotBlank(message = "Unit is required")
    @Size(max = 50, message = "Unit cannot exceed 50 characters")
    private String unit;

    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    // List of schedule times in HH:mm format, size must match frequency
    @NotEmpty(message = "Schedule times are required")
    private List<String> scheduleTimes;
}
