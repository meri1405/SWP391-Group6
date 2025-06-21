package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO cho việc tạo học sinh mới
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentCreationDTO {
    
    @NotBlank(message = "Tên không được để trống")
    private String firstName;
    
    @NotBlank(message = "Họ không được để trống")
    private String lastName;
    
    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dob;
    
    @NotBlank(message = "Giới tính không được để trống")
    @Pattern(regexp = "^[MF]$", message = "Giới tính phải là M hoặc F")
    private String gender;
    
    @NotBlank(message = "Lớp học không được để trống")
    private String className;
    
    @NotBlank(message = "Nơi sinh không được để trống")
    private String birthPlace;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    
    @NotBlank(message = "Quốc tịch không được để trống")
    private String citizenship;
    
    @NotNull(message = "Trạng thái khuyết tật không được để trống")
    private Boolean isDisabled;
}
