package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho việc xem thông tin học sinh dành cho Admin
 * Admin chỉ có quyền xem thông tin học sinh, KHÔNG thể tạo/sửa/xóa
 * Manager sẽ là người quản lý học sinh
 */
@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {
      @Autowired
    private IStudentService studentService;
      @Autowired
    private IParentService parentService;
    
    /**
     * Lấy danh sách tất cả phụ huynh
     * Admin có thể xem danh sách phụ huynh để quản lý tài khoản
     * 
     * @return Danh sách tất cả phụ huynh trong hệ thống
     */
    @GetMapping("/parents")
    public ResponseEntity<?> getAllParents() {
        try {
            List<ParentDTO> parents = parentService.getAllParents();
            return ResponseEntity.ok(parents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi lấy danh sách phụ huynh: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách tất cả học sinh
     * 
     * @return Danh sách tất cả học sinh trong hệ thống
     */
    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        try {
            List<StudentDTO> students = studentService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi lấy danh sách học sinh: " + e.getMessage()));        }
    }
    
    /**
     * Lấy thông tin học sinh theo ID (chỉ xem)
     * Admin chỉ có thể xem chi tiết học sinh
     * 
     * @param studentId ID của học sinh
     * @return Thông tin chi tiết học sinh
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi lấy thông tin học sinh: " + e.getMessage()));
        }
    }
    
    /**
     * DTO for error responses
     */
    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    /**
     * DTO for success responses
     */
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
