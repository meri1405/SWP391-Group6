package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent/students")
@PreAuthorize("hasRole('PARENT')")  // Only parents can access these endpoints
public class ParentStudentController {

    @Autowired
    private IStudentService studentService;

    /**
     * Get all students associated with the authenticated parent
     */
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getMyStudents(@AuthenticationPrincipal User parent) {
        List<StudentDTO> students = studentService.getStudentsByParent(parent);
        return ResponseEntity.ok(students);
    }

    /**
     * Get specific student details (only if parent has access)
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getMyStudent(@PathVariable Long studentId,
                                        @AuthenticationPrincipal User parent) {
        try {
            // Verify the student belongs to the parent
            if (!studentService.isStudentOwnedByParent(studentId, parent.getId())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "You are not authorized to access this student's information");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}
