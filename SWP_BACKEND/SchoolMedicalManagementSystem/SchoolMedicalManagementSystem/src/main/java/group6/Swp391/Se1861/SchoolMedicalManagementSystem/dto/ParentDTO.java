package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParentDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private String jobTitle;
    private String address;
    private LocalDate dob;
    private Boolean enabled;
    
    /**
     * Lấy tên đầy đủ của phụ huynh
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
