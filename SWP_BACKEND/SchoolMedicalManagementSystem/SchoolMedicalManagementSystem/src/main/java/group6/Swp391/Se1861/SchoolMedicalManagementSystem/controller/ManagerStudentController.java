package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsCreationResponseDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho việc quản lý học sinh dành cho Manager
 * Manager có thể tạo, xóa học sinh cùng với phụ huynh và quản lý học sinh
 * Manager không thể quản lý phụ huynh trực tiếp (chỉ Admin mới có quyền quản lý tài khoản phụ huynh)
 */
@RestController
@RequestMapping("/api/manager/students")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerStudentController {
    
    @Autowired
    private IStudentService studentService;
    
    /**
     * Tạo học sinh cùng với phụ huynh trong cùng một form
     * Manager có thể tạo cả học sinh và phụ huynh
     * 
     * @param request DTO chứa thông tin học sinh và phụ huynh
     * @return Response chứa thông tin học sinh và phụ huynh đã được tạo
     */
    @PostMapping("/create-with-parents")
    public ResponseEntity<?> createStudentWithParents(@Valid @RequestBody StudentWithParentsCreationDTO request) {
        try {
            StudentWithParentsCreationResponseDTO response = studentService.createStudentWithParents(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi tạo học sinh và phụ huynh: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách tất cả học sinh
     * Manager có thể xem danh sách học sinh
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
                    .body(new ErrorResponse("Có lỗi xảy ra khi lấy danh sách học sinh: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy thông tin học sinh theo ID
     * Manager có thể xem chi tiết học sinh
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
     * Xóa liên kết phụ huynh khỏi học sinh
     * Manager có thể quản lý mối quan hệ giữa học sinh và phụ huynh
     * 
     * @param studentId ID của học sinh
     * @param parentType Loại phụ huynh ("father" hoặc "mother")
     * @return Thông báo kết quả
     */
    @DeleteMapping("/{studentId}/parents/{parentType}")
    public ResponseEntity<?> removeParentFromStudent(@PathVariable Long studentId, 
                                                   @PathVariable String parentType) {
        try {
            studentService.removeParentFromStudent(studentId, parentType);
            return ResponseEntity.ok(new SuccessResponse("Đã xóa liên kết " + parentType + " khỏi học sinh thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi xóa liên kết phụ huynh: " + e.getMessage()));
        }
    }
    
    /**
     * Xóa học sinh
     * Manager có thể xóa học sinh
     * 
     * @param studentId ID của học sinh cần xóa
     * @return Thông báo kết quả
     */
    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        try {
            studentService.deleteStudent(studentId);
            return ResponseEntity.ok(new SuccessResponse("Đã xóa học sinh thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi xóa học sinh: " + e.getMessage()));
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
