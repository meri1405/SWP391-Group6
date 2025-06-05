package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get all students associated with a parent
     * @param parent the authenticated parent user
     * @return list of students associated with the parent
     */
    public List<StudentDTO> getStudentsByParent(User parent) {
        List<Student> students = studentRepository.findByParentsWithParents(parent);
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all students (admin only)
     * @return list of all students
     */
    public List<StudentDTO> getAllStudents() {
        List<Student> students = studentRepository.findAllWithParents();
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get student by ID (admin and parents can access their children)
     * @param studentId the student ID
     * @return the student DTO
     * @throws IllegalArgumentException if student not found
     */
    public StudentDTO getStudentById(Long studentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        return convertToDTO(student);
    }

    /**
     * Add parent to existing student (admin only)
     * @param studentId the student ID
     * @param parentId the parent ID
     * @throws IllegalArgumentException if student or parent not found, or relationship already exists
     */
    @Transactional
    public void addParentToStudent(Long studentId, Long parentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        
        addParentToStudentInternal(student, parentId);
    }

    /**
     * Remove parent from student (admin only)
     * @param studentId the student ID
     * @param parentId the parent ID
     * @throws IllegalArgumentException if student or parent not found, or relationship doesn't exist
     */
    @Transactional
    public void removeParentFromStudent(Long studentId, Long parentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent not found with id: " + parentId));
        
        // Check if parent has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new IllegalArgumentException("User with id " + parentId + " is not a parent");
        }
        
        // Check if relationship exists
        if (!student.getParents().contains(parent)) {
            throw new IllegalArgumentException("Parent is not associated with this student");
        }
        
        // Remove the relationship from both sides
        student.getParents().remove(parent);
        parent.getStudents().remove(student);
        
        // Save both entities
        studentRepository.save(student);
        userRepository.save(parent);
    }

    /**
     * Check if a student is owned by a specific parent
     * @param studentId the student ID
     * @param parentId the parent ID
     * @return true if the parent has access to the student
     */
    public boolean isStudentOwnedByParent(Long studentId, Long parentId) {
        Optional<Student> student = studentRepository.findByIdWithParents(studentId);
        if (student.isEmpty()) {
            return false;
        }
        
        return student.get().getParents().stream()
                .anyMatch(parent -> parent.getId().equals(parentId));
    }

    /**
     * Internal method to add parent to student
     * @param student the student entity
     * @param parentId the parent ID
     */
    private void addParentToStudentInternal(Student student, Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent not found with id: " + parentId));
        
        // Check if parent has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new IllegalArgumentException("User with id " + parentId + " is not a parent");
        }
        
        // Check if relationship already exists
        if (student.getParents().contains(parent)) {
            throw new IllegalArgumentException("Parent is already associated with this student");
        }
        
        // Add the relationship
        student.getParents().add(parent);
        parent.getStudents().add(student);
        
        // Save both entities
        studentRepository.save(student);
        userRepository.save(parent);
    }

    /**
     * Convert Student entity to StudentDTO
     */
    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentID(student.getStudentID());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setDob(student.getDob());
        dto.setGender(student.getGender());
        dto.setClassName(student.getClassName());
        dto.setBirthPlace(student.getBirthPlace());
        dto.setAddress(student.getAddress());
        dto.setCitizenship(student.getCitizenship());
        dto.setBloodType(student.getBloodType());
        dto.setDisabled(student.isDisabled());
        
        // Convert parents to ParentDTO list
        if (student.getParents() != null) {
            List<ParentDTO> parentDTOs = student.getParents().stream()
                    .map(this::convertParentToDTO)
                    .collect(Collectors.toList());
            dto.setParents(parentDTOs);
        }
        
        return dto;
    }
    
    /**
     * Convert User (parent) entity to ParentDTO
     */
    private ParentDTO convertParentToDTO(User parent) {
        ParentDTO dto = new ParentDTO();
        if (parent.getRole().getRoleName().equalsIgnoreCase("PARENT")) {
            dto.setId(parent.getId());
            dto.setFirstName(parent.getFirstName());
            dto.setLastName(parent.getLastName());
            dto.setPhone(parent.getPhone());
        }
        return dto;
    }
}
