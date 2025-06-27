package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRuleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationRule;

import java.util.List;

public interface IVaccinationRuleService {

    VaccinationRuleDTO createVaccinationRule(User user, VaccinationRuleDTO vaccinationRuleDTO);

    List<VaccinationRuleDTO> getAllVaccinationRules();

    VaccinationRuleDTO getVaccinationRuleById(Long id);

    VaccinationRuleDTO updateVaccinationRule(Long id, User user, VaccinationRuleDTO vaccinationRuleDTO);

    void deleteVaccinationRule(Long id, User user);

    VaccinationRuleDTO convertToDTO(VaccinationRule rule);


}
