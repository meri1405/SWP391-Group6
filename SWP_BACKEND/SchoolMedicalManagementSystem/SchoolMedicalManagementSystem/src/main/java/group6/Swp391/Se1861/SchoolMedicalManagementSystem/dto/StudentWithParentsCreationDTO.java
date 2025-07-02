package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho việc tạo học sinh cùng với phụ huynh trong cùng một form
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentWithParentsCreationDTO {
    
    /**
     * Danh sách các học sinh cần tạo
     * Có thể thêm một hoặc nhiều học sinh
     */
    @NotEmpty(message = "Danh sách học sinh không được rỗng")
    @Valid
    private List<StudentCreationDTO> students;
    
    /**
     * Thông tin cha (tùy chọn)
     */
    @Valid
    private ParentCreationDTO father;
    
    /**
     * Thông tin mẹ (tùy chọn)
     */
    @Valid
    private ParentCreationDTO mother;
    
    /**
     * Kiểm tra xem có thông tin phụ huynh nào không
     */
    public boolean hasAnyParent() {
        return father != null || mother != null;
    }
    
    /**
     * Kiểm tra xem có cả cha và mẹ không
     */
    public boolean hasBothParents() {
        return father != null && mother != null;
    }
}
