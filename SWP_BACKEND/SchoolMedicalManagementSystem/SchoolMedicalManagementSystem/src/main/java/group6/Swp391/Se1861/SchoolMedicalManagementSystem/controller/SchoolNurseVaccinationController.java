package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRuleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationRuleService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.VaccinationRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nurse/vaccination-rules")
public class SchoolNurseVaccinationController {

    @Autowired
    private IVaccinationRuleService vaccinationRuleService;

    /**
     * Create a new vaccination rule (only accessible to SCHOOLNURSE users)
     *
     * @param user authenticated user
     * @param vaccinationRuleDTO vaccination rule data
     * @return created vaccination rule
     */
    @PostMapping
    public ResponseEntity<VaccinationRuleDTO> createVaccinationRule(
            @AuthenticationPrincipal User user,
            @RequestBody VaccinationRuleDTO vaccinationRuleDTO) {

        // Service method already includes SCHOOLNURSE role validation
        VaccinationRuleDTO createdRule = vaccinationRuleService.createVaccinationRule(user, vaccinationRuleDTO);
        return new ResponseEntity<>(createdRule, HttpStatus.CREATED);
    }

    /**
     * Get all vaccination rules
     *
     * @return list of all vaccination rules
     */
    @GetMapping
    public ResponseEntity<List<VaccinationRuleDTO>> getAllVaccinationRules() {
        List<VaccinationRuleDTO> rules = vaccinationRuleService.getAllVaccinationRules();
        return ResponseEntity.ok(rules);
    }

    /**
     * Get a vaccination rule by ID
     *
     * @param id ID of the vaccination rule
     * @return vaccination rule data
     */
    @GetMapping("/{id}")
    public ResponseEntity<VaccinationRuleDTO> getVaccinationRuleById(@PathVariable Long id) {
        VaccinationRuleDTO rule = vaccinationRuleService.getVaccinationRuleById(id);
        return ResponseEntity.ok(rule);
    }

    /**
     * Update an existing vaccination rule
     *
     * @param id ID of the vaccination rule to update
     * @param user authenticated user
     * @param vaccinationRuleDTO updated vaccination rule data
     * @return updated vaccination rule
     */
    @PutMapping("/{id}")
    public ResponseEntity<VaccinationRuleDTO> updateVaccinationRule(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody VaccinationRuleDTO vaccinationRuleDTO) {

        VaccinationRuleDTO updatedRule = vaccinationRuleService.updateVaccinationRule(id, user, vaccinationRuleDTO);
        return ResponseEntity.ok(updatedRule);
    }

    /**
     * Delete a vaccination rule
     *
     * @param id ID of the vaccination rule to delete
     * @param user authenticated user
     * @return no content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVaccinationRule(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        vaccinationRuleService.deleteVaccinationRule(id, user);
        return ResponseEntity.noContent().build();
    }
}
