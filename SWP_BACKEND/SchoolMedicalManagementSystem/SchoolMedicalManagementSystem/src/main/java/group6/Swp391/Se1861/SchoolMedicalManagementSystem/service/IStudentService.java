package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsCreationResponseDTO;
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

    /**
     * Create students with parents in one transaction
     * This method handles creating multiple students and their parents (father, mother, or both)
     * @param request DTO containing student and parent information
     * @return Response containing created students and parents
     */    StudentWithParentsCreationResponseDTO createStudentWithParents(StudentWithParentsCreationDTO request);

    /**
     * Delete a student by ID
     * @param studentId the student ID to delete
     * @throws IllegalArgumentException if student not found
     */
    void deleteStudent(Long studentId);
}
