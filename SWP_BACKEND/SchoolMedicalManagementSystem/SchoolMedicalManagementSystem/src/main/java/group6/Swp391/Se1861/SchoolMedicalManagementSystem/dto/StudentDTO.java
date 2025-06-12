package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String className;
    private String birthPlace;
    private String address;
    private String citizenship;
    private String bloodType;
    private boolean isDisabled;
    private Long motherId;
    private Long fatherId;

    /**
     * Create a StudentDTO from a Student entity
     * @param student the student entity
     * @return a new StudentDTO with basic information
     */
    public static StudentDTO fromStudent(Student student) {
        if (student == null) {
            return null;
        }
        
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getStudentID());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setClassName(student.getClassName());
        
        if (student.getMother() != null) {
            dto.setMotherId(student.getMother().getId());
        }
        
        if (student.getFather() != null) {
            dto.setFatherId(student.getFather().getId());
        }
        
        return dto;
    }
}
