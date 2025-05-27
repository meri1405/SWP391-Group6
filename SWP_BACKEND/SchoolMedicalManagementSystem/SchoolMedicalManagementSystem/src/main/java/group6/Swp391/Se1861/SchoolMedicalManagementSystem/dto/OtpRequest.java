package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpRequest {
    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]{10}$", message = "Phone number must be 10 digits and may start with 0")
    private String phoneNumber;
}
