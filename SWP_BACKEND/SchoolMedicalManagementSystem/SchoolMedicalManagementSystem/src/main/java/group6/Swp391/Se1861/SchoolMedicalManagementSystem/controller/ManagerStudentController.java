package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/students")
@PreAuthorize("hasRole('MANAGER')")  // Only managers can access these endpoints
public class ManagerStudentController {

    @Autowired
    private IStudentService studentService;

    /**
     * Create a new student
     */
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody StudentDTO studentDTO) {
        try {
            StudentDTO createdStudent = studentService.createStudent(studentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Update an existing student
     */
    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable Long studentId, @RequestBody StudentDTO studentDTO) {
        try {
            StudentDTO updatedStudent = studentService.updateStudent(studentId, studentDTO);
            return ResponseEntity.ok(updatedStudent);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not Found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Delete a student
     */
    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        try {
            studentService.deleteStudent(studentId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not Found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Get all students
     */
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    /**
     * Get student by ID
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not Found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
} 