package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationForm;

import java.util.List;

public interface IVaccinationFormService {
    
    VaccinationFormDTO getFormById(Long id);
    
    List<VaccinationFormDTO> getFormsByParent(User parent);
    
    List<VaccinationFormDTO> getPendingFormsByParent(User parent);
    
    VaccinationFormDTO confirmForm(Long formId, User parent, String parentNotes);
    
    VaccinationFormDTO declineForm(Long formId, User parent, String parentNotes);
    
    List<VaccinationFormDTO> getExpiredForms();
    
    void markFormsAsExpired();
    
    VaccinationFormDTO convertToDTO(VaccinationForm form);
}
