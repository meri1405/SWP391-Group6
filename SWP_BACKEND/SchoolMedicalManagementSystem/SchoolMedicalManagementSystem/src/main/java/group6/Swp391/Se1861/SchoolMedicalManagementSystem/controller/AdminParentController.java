package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho việc quản lý tài khoản phụ huynh dành cho Admin
 * Admin chỉ có thể quản lý tài khoản phụ huynh (xem, kích hoạt/vô hiệu hóa)
 * KHÔNG thể tạo/sửa thông tin phụ huynh (Manager sẽ tạo thông qua tạo học sinh)
 */
@RestController
@RequestMapping("/api/admin/parents")
@PreAuthorize("hasRole('ADMIN')")
public class AdminParentController {
    
    @Autowired
    private IParentService parentService;
    
    /**
     * Lấy danh sách tất cả phụ huynh
     * Chỉ Admin mới có quyền xem danh sách phụ huynh
     * 
     * @return Danh sách tất cả phụ huynh trong hệ thống
     */
    @GetMapping
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
     * Lấy thông tin phụ huynh theo ID
     * Chỉ Admin mới có quyền xem chi tiết phụ huynh
     * 
     * @param parentId ID của phụ huynh
     * @return Thông tin chi tiết phụ huynh
     */
    @GetMapping("/{parentId}")
    public ResponseEntity<?> getParentById(@PathVariable Long parentId) {
        try {
            ParentDTO parent = parentService.getParentById(parentId);
            return ResponseEntity.ok(parent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi lấy thông tin phụ huynh: " + e.getMessage()));
        }
    }
    
    /**
     * Kích hoạt/vô hiệu hóa tài khoản phụ huynh
     * Admin có quyền quản lý trạng thái tài khoản phụ huynh
     * 
     * @param parentId ID của phụ huynh
     * @param enabled Trạng thái kích hoạt (true/false)
     * @return Thông báo kết quả
     */
    @PatchMapping("/{parentId}/status")
    public ResponseEntity<?> updateParentStatus(@PathVariable Long parentId, 
                                              @RequestParam Boolean enabled) {
        try {
            parentService.updateParentStatus(parentId, enabled);
            String status = enabled ? "kích hoạt" : "vô hiệu hóa";
            return ResponseEntity.ok(new SuccessResponse("Đã " + status + " tài khoản phụ huynh thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi cập nhật trạng thái phụ huynh: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách con em của phụ huynh
     * Admin có thể xem con em của phụ huynh bất kỳ
     * 
     * @param parentId ID của phụ huynh
     * @return Danh sách con em của phụ huynh
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<?> getParentChildren(@PathVariable Long parentId) {
        try {
            List<Object> children = parentService.getParentChildren(parentId);
            return ResponseEntity.ok(children);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Có lỗi xảy ra khi lấy danh sách con em: " + e.getMessage()));
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
