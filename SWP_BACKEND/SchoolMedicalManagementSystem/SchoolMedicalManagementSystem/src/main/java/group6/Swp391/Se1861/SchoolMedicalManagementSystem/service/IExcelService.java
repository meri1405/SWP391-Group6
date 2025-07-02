package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsCreationResponseDTO;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for Excel file processing
 * Used for importing students and parents from Excel files
 */
public interface IExcelService {
    
    /**
     * Import students and parents from Excel file
     * @param file Excel file (.xlsx or .xls)
     * @return Response containing imported students and parents
     * @throws IllegalArgumentException if file format is invalid or contains errors
     */
    StudentWithParentsCreationResponseDTO importStudentsFromExcel(MultipartFile file);
    
    /**
     * Generate Excel template for student import
     * @return byte array of Excel template file
     */
    byte[] generateExcelTemplate();
    
    /**
     * Validate Excel file format and content
     * @param file Excel file to validate
     * @return true if file is valid, throws exception if invalid
     * @throws IllegalArgumentException if file is invalid
     */
    boolean validateExcelFile(MultipartFile file);
}
