package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentManagementService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentManagementService implements IStudentManagementService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public List<StudentDTO> createStudentWithParents(StudentWithParentsDTO dto) {
        // First, create parent users
        List<User> createdParents = dto.getParents().stream()
            .map(parentDTO -> {
                User parent = new User();
                parent.setFirstName(parentDTO.getFirstName());
                parent.setLastName(parentDTO.getLastName());
                parent.setEmail(parentDTO.getEmail());
                parent.setPhone(parentDTO.getPhone());
                parent.setAddress(parentDTO.getAddress());
                parent.setUsername(parentDTO.getEmail());
                parent.setPassword(passwordEncoder.encode(String.valueOf(Math.random()).substring(2, 10)));
                parent.setEnabled(true);
                parent.setJobTitle("Parent");
                
                // Set parent role
                Role parentRole = roleRepository.findByRoleName("PARENT")
                    .orElseThrow(() -> new EntityNotFoundException("PARENT role not found"));
                parent.setRole(parentRole);
                
                return userRepository.save(parent);
            })
            .collect(Collectors.toList());

        // Then, create students and link them to parents
        List<StudentDTO> createdStudents = dto.getStudents().stream()
            .map(studentDTO -> {
                Student student = new Student();
                updateStudentFromDTO(student, studentDTO);
                
                // Link to first parent (you might want to modify this logic based on your requirements)
                if (!createdParents.isEmpty()) {
                    student.setFather(createdParents.get(0));
                }
                
                Student savedStudent = studentRepository.save(student);
                return convertToDTO(savedStudent);
            })
            .collect(Collectors.toList());

        return createdStudents;
    }

    @Override
    @Transactional
    public StudentDTO createStudent(StudentCreationDTO studentDTO) {
        Student student = new Student();
        updateStudentFromDTO(student, studentDTO);
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long studentId, StudentCreationDTO studentDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        updateStudentFromDTO(student, studentDTO);
        Student updatedStudent = studentRepository.save(student);
        return convertToDTO(updatedStudent);
    }

    @Override
    @Transactional
    public void deleteStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new EntityNotFoundException("Student not found with id: " + studentId);
        }
        studentRepository.deleteById(studentId);
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StudentDTO getStudentById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        return convertToDTO(student);
    }

    @Override
    public List<User> getAllParents() {
        Role parentRole = roleRepository.findByRoleName("PARENT")
                .orElseThrow(() -> new EntityNotFoundException("PARENT role not found"));
        return userRepository.findByRoleRoleName("PARENT");
    }

    @Override
    @Transactional
    public User createParent(User parent) {
        // Set parent role
        Role parentRole = roleRepository.findByRoleName("PARENT")
                .orElseThrow(() -> new EntityNotFoundException("PARENT role not found"));
        parent.setRole(parentRole);

        // Encode password if provided
        if (parent.getPassword() != null) {
            parent.setPassword(passwordEncoder.encode(parent.getPassword()));
        }

        return userRepository.save(parent);
    }

    private void updateStudentFromDTO(Student student, StudentCreationDTO dto) {
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setDob(dto.getDob());
        student.setGender(dto.getGender());
        student.setClassName(dto.getClassName());
        student.setBirthPlace(dto.getBirthPlace());
        student.setAddress(dto.getAddress());
        student.setCitizenship(dto.getCitizenship());
        student.setBloodType(dto.getBloodType());
        student.setDisabled(dto.isDisabled());

        // Set parents if provided
        if (dto.getMotherId() != null) {
            User mother = userRepository.findById(dto.getMotherId())
                    .orElseThrow(() -> new EntityNotFoundException("Mother not found with id: " + dto.getMotherId()));
            student.setMother(mother);
        }
        if (dto.getFatherId() != null) {
            User father = userRepository.findById(dto.getFatherId())
                    .orElseThrow(() -> new EntityNotFoundException("Father not found with id: " + dto.getFatherId()));
            student.setFather(father);
        }
    }

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
        
        if (student.getFather() != null) {
            dto.setFatherId(student.getFather().getId());
        }
        if (student.getMother() != null) {
            dto.setMotherId(student.getMother().getId());
        }
        
        return dto;
    }
} 