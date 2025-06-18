package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRecordDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationRecord;

import java.util.List;

public interface IVaccinationRecordService {
    
    VaccinationRecordDTO getRecordById(Long id);
    
    List<VaccinationRecordDTO> getRecordsByStudent(Student student);
    
    List<VaccinationRecordDTO> getRecordsNeedingFollowUp();
    
    List<VaccinationRecordDTO> getSevereReactions();
    
    VaccinationRecordDTO updateRecord(Long id, VaccinationRecordDTO recordDTO, User nurse);
    
    VaccinationRecordDTO addFollowUpNotes(Long id, String followUpNotes, User nurse);
    
    VaccinationRecordDTO markAsResolved(Long id, User nurse);
    
    void syncToVaccinationHistory(Long recordId);
    
    VaccinationRecordDTO convertToDTO(VaccinationRecord record);
}
