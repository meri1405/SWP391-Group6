package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRuleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationRule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationRuleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccinationRuleService implements IVaccinationRuleService {

    @Autowired
    private VaccinationRuleRepository vaccinationRuleRepository;

    /**
     * Creates a new vaccination rule. Only SCHOOLNURSE users can create vaccination rules.
     *
     * @param user The user attempting to create the rule
     * @param vaccinationRuleDTO The vaccination rule data
     * @return The created vaccination rule
     */
    @Override
    public VaccinationRuleDTO createVaccinationRule(User user, VaccinationRuleDTO vaccinationRuleDTO) {
        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can create vaccination rules");
        }        // Create new vaccination rule from DTO
        VaccinationRule vaccinationRule = new VaccinationRule();
        vaccinationRule.setName(vaccinationRuleDTO.getName());
        vaccinationRule.setDescription(vaccinationRuleDTO.getDescription());
        vaccinationRule.setDoesNumber(vaccinationRuleDTO.getDoesNumber());        vaccinationRule.setMinAge(vaccinationRuleDTO.getMinAge());
        vaccinationRule.setMaxAge(vaccinationRuleDTO.getMaxAge());
        vaccinationRule.setIntervalDays(vaccinationRuleDTO.getIntervalDays());
        vaccinationRule.setMandatory(vaccinationRuleDTO.isMandatory());

        // Save the vaccination rule
        VaccinationRule savedRule = vaccinationRuleRepository.save(vaccinationRule);

        // Convert saved entity back to DTO
        vaccinationRuleDTO.setId(savedRule.getId());
        return vaccinationRuleDTO;
    }

    /**
     * Retrieves all vaccination rules
     *
     * @return List of all vaccination rules
     */
    @Override
    public List<VaccinationRuleDTO> getAllVaccinationRules() {
        List<VaccinationRule> rules = vaccinationRuleRepository.findAll();
        return rules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a vaccination rule by ID
     *
     * @param id The ID of the vaccination rule to retrieve
     * @return The vaccination rule data
     */
    @Override
    public VaccinationRuleDTO getVaccinationRuleById(Long id) {
        VaccinationRule rule = vaccinationRuleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaccination rule not found"));
        return convertToDTO(rule);
    }

    /**
     * Updates an existing vaccination rule. Only SCHOOLNURSE users can update vaccination rules.
     *
     * @param id The ID of the vaccination rule to update
     * @param user The user attempting to update the rule
     * @param vaccinationRuleDTO The updated vaccination rule data
     * @return The updated vaccination rule
     */
    @Override
    public VaccinationRuleDTO updateVaccinationRule(Long id, User user, VaccinationRuleDTO vaccinationRuleDTO) {
        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can update vaccination rules");
        }

        // Find existing vaccination rule
        VaccinationRule existingRule = vaccinationRuleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaccination rule not found"));        // Update the rule with new data
        existingRule.setName(vaccinationRuleDTO.getName());
        existingRule.setDescription(vaccinationRuleDTO.getDescription());
        existingRule.setDoesNumber(vaccinationRuleDTO.getDoesNumber());
        existingRule.setMinAge(vaccinationRuleDTO.getMinAge());
        existingRule.setMaxAge(vaccinationRuleDTO.getMaxAge());
        existingRule.setIntervalDays(vaccinationRuleDTO.getIntervalDays());
        existingRule.setMandatory(vaccinationRuleDTO.isMandatory());

        // Save the updated rule
        VaccinationRule savedRule = vaccinationRuleRepository.save(existingRule);

        return convertToDTO(savedRule);
    }

    /**
     * Deletes a vaccination rule. Only SCHOOLNURSE users can delete vaccination rules.
     * Rules that are associated with existing vaccination campaigns cannot be deleted.
     *
     * @param id The ID of the vaccination rule to delete
     * @param user The user attempting to delete the rule
     */
    @Override
    public void deleteVaccinationRule(Long id, User user) {
        // Verify user has SCHOOLNURSE role
        if (user == null || !user.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can delete vaccination rules");
        }

        // Find existing vaccination rule
        VaccinationRule existingRule = vaccinationRuleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaccination rule not found"));
        
        // Check if the rule is being used in any campaigns
        if (!existingRule.getVaccinationCampaigns().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Cannot delete vaccination rule that is associated with existing campaigns");
        }

        // Delete the rule
        vaccinationRuleRepository.delete(existingRule);
    }

    /**
     * Converts a VaccinationRule entity to a VaccinationRuleDTO
     *
     * @param rule The entity to convert
     * @return The converted DTO
     */    @Override
    public VaccinationRuleDTO convertToDTO(VaccinationRule rule) {
        VaccinationRuleDTO dto = new VaccinationRuleDTO();
        dto.setId(rule.getId());
        dto.setName(rule.getName());
        dto.setDescription(rule.getDescription());
        dto.setDoesNumber(rule.getDoesNumber());
        dto.setMinAge(rule.getMinAge());
        dto.setMaxAge(rule.getMaxAge());
        dto.setIntervalDays(rule.getIntervalDays());
        dto.setMandatory(rule.isMandatory());
        
        // Count active campaigns using this rule
        if (rule.getVaccinationCampaigns() != null) {
            long activeCampaigns = rule.getVaccinationCampaigns().stream()
                    .filter(campaign -> 
                        campaign.getStatus() == group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign.CampaignStatus.PENDING ||
                        campaign.getStatus() == group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign.CampaignStatus.APPROVED ||
                        campaign.getStatus() == group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign.CampaignStatus.IN_PROGRESS
                    ).count();
            dto.setActiveCampaignsCount((int) activeCampaigns);
        } else {
            dto.setActiveCampaignsCount(0);
        }
        
        return dto;
    }
}
