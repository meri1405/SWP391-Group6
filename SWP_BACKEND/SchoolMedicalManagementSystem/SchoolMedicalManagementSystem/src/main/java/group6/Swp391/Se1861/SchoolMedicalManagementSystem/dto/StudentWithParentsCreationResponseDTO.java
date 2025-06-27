package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho response khi tạo học sinh cùng với phụ huynh thành công
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentWithParentsCreationResponseDTO {
    
    /**
     * Danh sách các học sinh đã được tạo thành công
     */
    private List<StudentDTO> students;
    
    /**
     * Thông tin cha đã được tạo (nếu có)
     */
    private ParentDTO father;
    
    /**
     * Thông tin mẹ đã được tạo (nếu có)
     */
    private ParentDTO mother;
    
    /**
     * Thông báo kết quả
     */
    private String message;
}
