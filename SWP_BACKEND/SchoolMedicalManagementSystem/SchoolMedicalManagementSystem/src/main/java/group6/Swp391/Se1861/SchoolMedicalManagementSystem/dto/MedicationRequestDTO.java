package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicationRequestDTO {

    private Long id;

    @NotNull(message = "Request date is required")
    private LocalDate requestDate;

    //@NotBlank(message = "Note cannot be blank")
    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;

    private String status = "PENDING"; // Default status for new requests

    private boolean isConfirm = false; // Default confirmation status

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @Valid
    @NotEmpty(message = "At least one medication item is required")
    private List<ItemRequestDTO> itemRequests;
}
