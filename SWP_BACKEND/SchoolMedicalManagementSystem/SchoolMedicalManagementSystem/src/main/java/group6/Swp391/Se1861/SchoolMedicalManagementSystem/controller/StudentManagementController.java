package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/student-management")
@PreAuthorize("hasRole('MANAGER')")
public class StudentManagementController {

    @Autowired
    private IStudentManagementService studentManagementService;

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@Valid @RequestBody StudentCreationDTO studentDTO) {
        try {
            StudentDTO createdStudent = studentManagementService.createStudent(studentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create student");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/students/{studentId}")
    public ResponseEntity<?> updateStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody StudentCreationDTO studentDTO) {
        try {
            StudentDTO updatedStudent = studentManagementService.updateStudent(studentId, studentDTO);
            return ResponseEntity.ok(updatedStudent);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update student");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        try {
            studentManagementService.deleteStudent(studentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete student");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentManagementService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentManagementService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get student");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/parents")
    public ResponseEntity<List<User>> getAllParents() {
        List<User> parents = studentManagementService.getAllParents();
        return ResponseEntity.ok(parents);
    }

    @PostMapping("/parents")
    public ResponseEntity<?> createParent(@Valid @RequestBody User parent) {
        try {
            User createdParent = studentManagementService.createParent(parent);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdParent);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create parent");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/students-with-parents")
    public ResponseEntity<?> createStudentWithParents(@Valid @RequestBody StudentWithParentsDTO dto) {
        try {
            List<StudentDTO> createdStudents = studentManagementService.createStudentWithParents(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudents);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create students with parents");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
} 