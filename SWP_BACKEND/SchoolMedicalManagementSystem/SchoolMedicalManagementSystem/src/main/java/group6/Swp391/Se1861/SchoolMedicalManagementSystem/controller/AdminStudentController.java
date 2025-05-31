package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.config.AdminOnly;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MessageResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for admin student management operations
 * All endpoints in this controller require ADMIN role
 */
@RestController
@RequestMapping("/api/admin/students")
@AdminOnly(message = "Admin access required for all student management operations")
public class AdminStudentController {

    private final StudentService studentService;

    @Autowired
    public AdminStudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Create a new student with parent relationships
     * Admin can assign any parent to any student
     */
    @PostMapping("/create")
    public ResponseEntity<?> createStudent(@RequestBody StudentCreationDTO studentCreationDTO) {
        try {
            StudentDTO createdStudent = studentService.createStudentByAdmin(studentCreationDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student created successfully");
            response.put("studentId", createdStudent.getStudentID());
            response.put("fullName", createdStudent.getLastName() + " " + createdStudent.getFirstName());
            response.put("className", createdStudent.getClassName());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server error");
            errorResponse.put("message", "An unexpected error occurred while creating the student");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all students (admin only)
     */
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    /**
     * Get student by ID with parent information (admin only)
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Add parent to existing student (admin only)
     */
    @PostMapping("/{studentId}/parents/{parentId}")
    public ResponseEntity<?> addParentToStudent(@PathVariable Long studentId, @PathVariable Long parentId) {
        try {
            studentService.addParentToStudent(studentId, parentId);
            return ResponseEntity.ok(new MessageResponse("Parent added to student successfully"));
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Remove parent from student (admin only)
     */
    @DeleteMapping("/{studentId}/parents/{parentId}")
    public ResponseEntity<?> removeParentFromStudent(@PathVariable Long studentId, @PathVariable Long parentId) {
        try {
            studentService.removeParentFromStudent(studentId, parentId);
            return ResponseEntity.ok(new MessageResponse("Parent removed from student successfully"));
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}