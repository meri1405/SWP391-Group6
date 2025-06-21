package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * DTO cho việc tạo phụ huynh mới
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParentCreationDTO {
    
    @NotBlank(message = "Tên không được để trống")
    private String firstName;
    
    @NotBlank(message = "Họ không được để trống")
    private String lastName;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10}$", message = "Số điện thoại phải có 10 chữ số")
    private String phone;
    
    @NotBlank(message = "Giới tính không được để trống")
    @Pattern(regexp = "^[MF]$", message = "Giới tính phải là M hoặc F")
    private String gender;
    
    @NotBlank(message = "Nghề nghiệp không được để trống")
    private String jobTitle;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    
    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dob;
    
    /**
     * Trạng thái kích hoạt tài khoản
     * Mặc định là true nếu không được chỉ định
     */
    private Boolean enabled = true;
}
