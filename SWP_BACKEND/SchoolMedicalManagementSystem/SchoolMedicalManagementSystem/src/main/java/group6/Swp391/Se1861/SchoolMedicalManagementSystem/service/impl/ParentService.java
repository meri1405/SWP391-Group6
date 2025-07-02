package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing parent accounts
 * Only Admin should have access to these operations
 * Admin can only manage account status, not create/edit parent information
 */
@Service
public class ParentService implements IParentService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private IStudentService studentService;
    
    /**
     * Get all parents in the system
     * @return List of all parents
     */
    @Override
    public List<ParentDTO> getAllParents() {
        List<User> parents = userRepository.findByRole_RoleName("PARENT");
        return parents.stream()
                .map(this::convertUserToParentDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get parent by ID
     * @param parentId the parent ID
     * @return the parent DTO
     * @throws IllegalArgumentException if parent not found
     */
    @Override
    public ParentDTO getParentById(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phụ huynh với ID: " + parentId));
        
        // Verify it's a parent
        if (!"PARENT".equals(parent.getRoleName())) {
            throw new IllegalArgumentException("Người dùng với ID " + parentId + " không phải là phụ huynh");
        }
          return convertUserToParentDTO(parent);
    }
    
    /**
     * Update parent account status (enabled/disabled)
     * @param parentId the parent ID
     * @param enabled new status
     * @throws IllegalArgumentException if parent not found
     */
    @Transactional
    @Override
    public void updateParentStatus(Long parentId, Boolean enabled) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phụ huynh với ID: " + parentId));
        
        // Verify it's a parent
        if (!"PARENT".equals(parent.getRoleName())) {
            throw new IllegalArgumentException("Người dùng với ID " + parentId + " không phải là phụ huynh");
        }
        
        parent.setEnabled(enabled);
        userRepository.save(parent);
    }
    
    /**
     * Get children of a parent
     * @param parentId the parent ID
     * @return list of children (students)
     * @throws IllegalArgumentException if parent not found
     */
    @Override
    public List<Object> getParentChildren(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phụ huynh với ID: " + parentId));
        
        // Verify it's a parent
        if (!"PARENT".equals(parent.getRoleName())) {
            throw new IllegalArgumentException("Người dùng với ID " + parentId + " không phải là phụ huynh");
        }
        
        List<Student> children = studentRepository.findByParentWithParents(parent);
        List<Object> result = new ArrayList<>();
        
        for (Student child : children) {
            StudentDTO childDto = studentService.convertToDTO(child);
            result.add(childDto);
        }
        
        return result;
    }
    
    /**
     * Convert User entity to ParentDTO
     */
    private ParentDTO convertUserToParentDTO(User user) {
        ParentDTO dto = new ParentDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setGender(user.getGender());
        dto.setJobTitle(user.getJobTitle());
        dto.setAddress(user.getAddress());
        dto.setDob(user.getDob());
        dto.setEnabled(user.getEnabled());
        return dto;
    }
}
