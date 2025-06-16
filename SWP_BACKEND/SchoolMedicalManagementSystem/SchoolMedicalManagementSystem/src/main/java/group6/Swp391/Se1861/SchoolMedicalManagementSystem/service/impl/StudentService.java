package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService implements IStudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;    /**
     * Get all students associated with a parent
     * @param parent the authenticated parent user
     * @return list of students associated with the parent
     */
    @Override
    public List<StudentDTO> getStudentsByParent(User parent) {
        List<Student> students = studentRepository.findByParentWithParents(parent);
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all students (admin only)
     * @return list of all students
     */
    @Override
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
    @Override
    public StudentDTO getStudentById(Long studentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        return convertToDTO(student);
    }    /**
     * Add parent to existing student (admin only)
     * @param studentId the student ID
     * @param parentId the parent ID
     * @param parentType either "father" or "mother"
     * @throws IllegalArgumentException if student or parent not found, or relationship already exists
     */
    @Transactional
    @Override
    public void addParentToStudent(Long studentId, Long parentId, String parentType) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent not found with id: " + parentId));
        
        // Check if parent has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new IllegalArgumentException("User with id " + parentId + " is not a parent");
        }
        
        // Set parent based on type
        if ("father".equalsIgnoreCase(parentType)) {
            if (student.getFather() != null) {
                throw new IllegalArgumentException("Student already has a father assigned");
            }
            student.setFather(parent);
        } else if ("mother".equalsIgnoreCase(parentType)) {
            if (student.getMother() != null) {
                throw new IllegalArgumentException("Student already has a mother assigned");
            }
            student.setMother(parent);
        } else {
            throw new IllegalArgumentException("Parent type must be either 'father' or 'mother'");
        }
        
        studentRepository.save(student);
    }    /**
     * Remove parent from student (admin only)
     * @param studentId the student ID
     * @param parentType either "father" or "mother"
     * @throws IllegalArgumentException if student not found, or relationship doesn't exist
     */
    @Transactional
    @Override
    public void removeParentFromStudent(Long studentId, String parentType) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        
        // Remove parent based on type
        if ("father".equalsIgnoreCase(parentType)) {
            if (student.getFather() == null) {
                throw new IllegalArgumentException("Student does not have a father assigned");
            }
            student.setFather(null);
        } else if ("mother".equalsIgnoreCase(parentType)) {
            if (student.getMother() == null) {
                throw new IllegalArgumentException("Student does not have a mother assigned");
            }
            student.setMother(null);
        } else {
            throw new IllegalArgumentException("Parent type must be either 'father' or 'mother'");
        }
        
        studentRepository.save(student);
    }    /**
     * Check if a student is owned by a specific parent
     * @param studentId the student ID
     * @param parentId the parent ID
     * @return true if the parent has access to the student
     */
    @Override
    public boolean isStudentOwnedByParent(Long studentId, Long parentId) {
        return studentRepository.isStudentOwnedByParent(studentId, parentId);
    }
    /**
     * Convert Student entity to StudentDTO
     */
    @Override
    public StudentDTO convertToDTO(Student student) {
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
        
        // Set father and mother IDs
        if (student.getFather() != null) {
            dto.setFatherId(student.getFather().getId());
        }
        if (student.getMother() != null) {
            dto.setMotherId(student.getMother().getId());
        }
          return dto;
    }

    @Override
    @Transactional
    public StudentDTO createStudent(StudentDTO studentDTO) {
        // Validate required fields
        if (studentDTO.getFirstName() == null || studentDTO.getLastName() == null || 
            studentDTO.getDob() == null || studentDTO.getGender() == null || 
            studentDTO.getClassName() == null || studentDTO.getBirthPlace() == null || 
            studentDTO.getAddress() == null || studentDTO.getCitizenship() == null || 
            studentDTO.getBloodType() == null) {
            throw new IllegalArgumentException("All required fields must be provided");
        }

        // Create new student entity
        Student student = new Student();
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setDob(studentDTO.getDob());
        student.setGender(studentDTO.getGender());
        student.setClassName(studentDTO.getClassName());
        student.setBirthPlace(studentDTO.getBirthPlace());
        student.setAddress(studentDTO.getAddress());
        student.setCitizenship(studentDTO.getCitizenship());
        student.setBloodType(studentDTO.getBloodType());
        student.setDisabled(studentDTO.isDisabled());

        // Set parents if provided
        if (studentDTO.getMotherId() != null) {
            User mother = userRepository.findById(studentDTO.getMotherId())
                .orElseThrow(() -> new IllegalArgumentException("Mother not found with id: " + studentDTO.getMotherId()));
            student.setMother(mother);
        }
        if (studentDTO.getFatherId() != null) {
            User father = userRepository.findById(studentDTO.getFatherId())
                .orElseThrow(() -> new IllegalArgumentException("Father not found with id: " + studentDTO.getFatherId()));
            student.setFather(father);
        }

        // Save the student
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long studentId, StudentDTO studentDTO) {
        // Find existing student
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        // Update fields if provided
        if (studentDTO.getFirstName() != null) student.setFirstName(studentDTO.getFirstName());
        if (studentDTO.getLastName() != null) student.setLastName(studentDTO.getLastName());
        if (studentDTO.getDob() != null) student.setDob(studentDTO.getDob());
        if (studentDTO.getGender() != null) student.setGender(studentDTO.getGender());
        if (studentDTO.getClassName() != null) student.setClassName(studentDTO.getClassName());
        if (studentDTO.getBirthPlace() != null) student.setBirthPlace(studentDTO.getBirthPlace());
        if (studentDTO.getAddress() != null) student.setAddress(studentDTO.getAddress());
        if (studentDTO.getCitizenship() != null) student.setCitizenship(studentDTO.getCitizenship());
        if (studentDTO.getBloodType() != null) student.setBloodType(studentDTO.getBloodType());
        student.setDisabled(studentDTO.isDisabled());

        // Update parents if provided
        if (studentDTO.getMotherId() != null) {
            User mother = userRepository.findById(studentDTO.getMotherId())
                .orElseThrow(() -> new IllegalArgumentException("Mother not found with id: " + studentDTO.getMotherId()));
            student.setMother(mother);
        }
        if (studentDTO.getFatherId() != null) {
            User father = userRepository.findById(studentDTO.getFatherId())
                .orElseThrow(() -> new IllegalArgumentException("Father not found with id: " + studentDTO.getFatherId()));
            student.setFather(father);
        }

        // Save the updated student
        Student updatedStudent = studentRepository.save(student);
        return convertToDTO(updatedStudent);
    }

    @Override
    @Transactional
    public void deleteStudent(Long studentId) {
        // Check if student exists
        if (!studentRepository.existsById(studentId)) {
            throw new IllegalArgumentException("Student not found with id: " + studentId);
        }
        studentRepository.deleteById(studentId);
    }
}
