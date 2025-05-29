package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpRequest {    @NotBlank
    @Pattern(regexp = "^(0[0-9]{9}|\\+84[0-9]{9})$", message = "Phone number must be in Vietnamese format (0xxxxxxxxx) or international format (+84xxxxxxxxx)")
    private String phoneNumber;
}
