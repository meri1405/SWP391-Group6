package group6.Swp391.Se1861.SchoolMedicalManagementSystem.util;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for mapping Student entity to different formats
 */
public class StudentMapper {
    
    /**
     * Map Student entity to basic info Map
     */
    public static Map<String, Object> toBasicInfoMap(Student student) {
        Map<String, Object> studentInfo = new HashMap<>();
        studentInfo.put("id", student.getStudentID());
        studentInfo.put("firstName", student.getFirstName());
        studentInfo.put("lastName", student.getLastName());
        studentInfo.put("className", student.getClassName());
        studentInfo.put("gender", student.getGender());
        studentInfo.put("dateOfBirth", student.getDob());
        return studentInfo;
    }
    
    /**
     * Map Student entity to health profile status Map
     */
    public static Map<String, Object> toHealthProfileStatusMap(Student student) {
        Map<String, Object> studentInfo = toBasicInfoMap(student);
        
        // Check if student has health profile
        boolean hasHealthProfile = student.getHealthProfile() != null;
        studentInfo.put("hasHealthProfile", hasHealthProfile);
        studentInfo.put("healthProfileCount", hasHealthProfile ? 1 : 0);
        
        return studentInfo;
    }
} 