package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentCreationDTO {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^[MF]$", message = "Gender must be either 'M' or 'F'")
    private String gender;

    @NotBlank(message = "Class name is required")
    private String className;

    @NotBlank(message = "Birth place is required")
    private String birthPlace;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Citizenship is required")
    private String citizenship;

    @NotBlank(message = "Blood type is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood type format")
    private String bloodType;

    private boolean isDisabled;

    private Long motherId;
    private Long fatherId;
} 