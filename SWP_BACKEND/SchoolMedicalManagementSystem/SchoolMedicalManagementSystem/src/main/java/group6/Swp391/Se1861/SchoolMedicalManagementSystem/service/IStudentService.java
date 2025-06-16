package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.util.List;

public interface IStudentService {
    
    /**
     * Get all students associated with a parent
     */
    List<StudentDTO> getStudentsByParent(User parent);

    /**
     * Get all students
     */
    List<StudentDTO> getAllStudents();

    /**
     * Get student by ID
     */
    StudentDTO getStudentById(Long studentId);

    /**
     * Create a new student
     */
    StudentDTO createStudent(StudentDTO studentDTO);

    /**
     * Update an existing student
     */
    StudentDTO updateStudent(Long studentId, StudentDTO studentDTO);

    /**
     * Delete a student
     */
    void deleteStudent(Long studentId);

    /**
     * Add parent to student
     */
    void addParentToStudent(Long studentId, Long parentId, String parentType);

    /**
     * Remove parent from student
     */
    void removeParentFromStudent(Long studentId, String parentType);

    /**
     * Check if student is owned by parent
     */
    boolean isStudentOwnedByParent(Long studentId, Long parentId);

    /**
     * Convert student entity to DTO
     */
    StudentDTO convertToDTO(Student student);

}
