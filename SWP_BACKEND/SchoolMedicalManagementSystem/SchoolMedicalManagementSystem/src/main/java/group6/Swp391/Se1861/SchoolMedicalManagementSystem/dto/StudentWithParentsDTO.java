package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class StudentWithParentsDTO {
    @Valid
    @NotEmpty(message = "At least one parent is required")
    private List<ParentDTO> parents;

    @Valid
    @NotEmpty(message = "At least one student is required")
    private List<StudentCreationDTO> students;

    @Data
    public static class ParentDTO {
        @NotNull(message = "First name is required")
        private String firstName;

        @NotNull(message = "Last name is required")
        private String lastName;

        @NotNull(message = "Email is required")
        private String email;

        @NotNull(message = "Phone is required")
        private String phone;

        @NotNull(message = "Address is required")
        private String address;
    }
} 