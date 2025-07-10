package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentHealthCheckDTO {
    private Long studentId;
    private String studentCode;
    private String fullName;
    private String className;
    private String schoolYear;
    private LocalDate dob;
    private String gender;
    private String ageDisplay; // Format: "X tuổi Y tháng (Z tháng)"
    private FormStatus status; // PENDING, CONFIRMED, DECLINED
    private String statusDisplay; // Vietnamese display text
    private Long formId; // Health check form ID if exists
    private boolean hasParent; // Whether student has a parent account
    
    // Constructor for students without health check form
    public StudentHealthCheckDTO(Long studentId, String studentCode, String fullName, 
                                String className, String schoolYear, LocalDate dob, String gender, 
                                String ageDisplay, boolean hasParent) {
        this.studentId = studentId;
        this.studentCode = studentCode;
        this.fullName = fullName;
        this.className = className;
        this.schoolYear = schoolYear;
        this.dob = dob;
        this.gender = gender;
        this.ageDisplay = ageDisplay;
        this.hasParent = hasParent;
        this.status = null; // No form exists yet
        this.statusDisplay = "Chưa có phản hồi";
        this.formId = null;
    }
    
    // Constructor for students with health check form
    public StudentHealthCheckDTO(Long studentId, String studentCode, String fullName, 
                                String className, String schoolYear, LocalDate dob, String gender, 
                                String ageDisplay, FormStatus status, Long formId, boolean hasParent) {
        this.studentId = studentId;
        this.studentCode = studentCode;
        this.fullName = fullName;
        this.className = className;
        this.schoolYear = schoolYear;
        this.dob = dob;
        this.gender = gender;
        this.ageDisplay = ageDisplay;
        this.status = status;
        this.formId = formId;
        this.hasParent = hasParent;
        
        // Set Vietnamese status display
        if (status != null) {
            switch (status) {
                case CONFIRMED:
                    this.statusDisplay = "Đã đồng ý";
                    break;
                case DECLINED:
                    this.statusDisplay = "Đã từ chối";
                    break;
                case PENDING:
                    this.statusDisplay = "Chờ phản hồi";
                    break;
                default:
                    this.statusDisplay = "Chưa có phản hồi";
            }
        } else {
            this.statusDisplay = "Chưa có phản hồi";
        }
    }
}
