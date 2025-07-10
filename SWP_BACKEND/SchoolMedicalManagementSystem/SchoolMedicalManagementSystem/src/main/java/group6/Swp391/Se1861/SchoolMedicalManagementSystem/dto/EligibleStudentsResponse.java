package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EligibleStudentsResponse {
    private List<StudentVaccinationInfoDTO> eligibleStudents;
    private List<StudentVaccinationInfoDTO> ineligibleStudents;
    private String message;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StudentVaccinationInfoDTO {
        private Long studentId;
        private String studentFullName;
        private String studentCode;
        private Integer ageInMonths;
        private String className;
        private String schoolYear;
        private String ineligibilityReason;
        private List<VaccinationHistoryInfo> previousVaccinations;
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class VaccinationHistoryInfo {
            private String vaccineName;
            private Integer doseNumber;
            private String dateOfVaccination;
            private String source;
        }
    }
}
