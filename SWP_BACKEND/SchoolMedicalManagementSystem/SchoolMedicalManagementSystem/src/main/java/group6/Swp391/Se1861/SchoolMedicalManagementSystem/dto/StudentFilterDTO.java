package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentFilterDTO {
    private String searchName;      // Tìm kiếm theo tên (firstName hoặc lastName)
    private String className;       // Lọc theo lớp học
    private String birthPlace;      // Lọc theo nơi sinh
    private Integer birthYear;      // Lọc theo năm sinh
    private Integer page;           // Trang hiện tại (pagination)
    private Integer size;           // Số lượng item per page
    
    // Constructor for convenience
    public StudentFilterDTO(String searchName, String className, String birthPlace, Integer birthYear) {
        this.searchName = searchName;
        this.className = className;
        this.birthPlace = birthPlace;
        this.birthYear = birthYear;
        this.page = 0;
        this.size = 10;
    }
} 