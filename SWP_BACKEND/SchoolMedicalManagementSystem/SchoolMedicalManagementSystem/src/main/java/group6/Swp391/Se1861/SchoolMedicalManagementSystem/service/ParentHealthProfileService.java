package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ParentHealthProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private HealthProfileRepository healthProfileRepository;

    @Autowired
    private AllergiesRepository allergiesRepository;

    @Autowired
    private ChronicDiseasesRepository chronicDiseasesRepository;

    @Autowired
    private InfectiousDiseasesRepository infectiousDiseasesRepository;

    @Autowired
    private TreatmentHistoryRepository treatmentHistoryRepository;

    @Autowired
    private VisionRepository visionRepository;

    @Autowired
    private HearingRepository hearingRepository;    @Autowired
    private VaccinationHistoryRepository vaccinationHistoryRepository;

    @Autowired
    private VaccinationRuleRepository vaccinationRuleRepository;

    /**
     * Create a health profile for a child by a parent
     * @param parentId ID of the parent user
     * @param healthProfileDTO DTO containing health profile data
     * @return the created health profile
     */
    public HealthProfileDTO createHealthProfile(Long parentId, HealthProfileDTO healthProfileDTO) {
        // Validate required fields
        if (healthProfileDTO.getStudentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required and cannot be null");
        }

        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can create health profiles for students");
        }

        // Validate student exists
        Student student = studentRepository.findById(healthProfileDTO.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Validate parent is related to student        
        if (!isParentRelatedToStudent(parent, student)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Parent is not associated with this student");
        }

        // Create health profile
        HealthProfile healthProfile = new HealthProfile();
        healthProfile.setWeight(healthProfileDTO.getWeight());
        healthProfile.setHeight(healthProfileDTO.getHeight());
        healthProfile.setCreatedAt(LocalDate.now());
        healthProfile.setUpdatedAt(LocalDate.now());
        healthProfile.setStatus(ProfileStatus.PENDING);
        healthProfile.setNote(healthProfileDTO.getNote());
        healthProfile.setStudent(student);
        healthProfile.setParent(parent);

        // Save health profile
        HealthProfile savedProfile = healthProfileRepository.save(healthProfile);

        // Create and save allergies if provided
        if (healthProfileDTO.getAllergies() != null) {
            for (AllergiesDTO allergyDTO : healthProfileDTO.getAllergies()) {
                Allergies allergy = new Allergies();
                allergy.setAllergyType(allergyDTO.getAllergyType());
                allergy.setDescription(allergyDTO.getDescription());
                allergy.setStatus(allergyDTO.getStatus());
                allergy.setOnsetDate(allergyDTO.getOnsetDate());
                allergy.setHealthProfile(savedProfile);
                allergiesRepository.save(allergy);
            }
        }

        // Create and save chronic diseases if provided
        if (healthProfileDTO.getChronicDiseases() != null) {
            for (ChronicDiseasesDTO diseaseDTO : healthProfileDTO.getChronicDiseases()) {
                ChronicDiseases disease = new ChronicDiseases();
                disease.setDiseaseName(diseaseDTO.getDiseaseName());
                disease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                disease.setDateResolved(diseaseDTO.getDateResolved());
                disease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                disease.setDescription(diseaseDTO.getDescription());
                disease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                disease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                disease.setStatus(diseaseDTO.getStatus());
                disease.setHealthProfile(savedProfile);
                chronicDiseasesRepository.save(disease);
            }
        }

        // Create and save infectious diseases if provided
        if (healthProfileDTO.getInfectiousDiseases() != null) {
            for (InfectiousDiseasesDTO diseaseDTO : healthProfileDTO.getInfectiousDiseases()) {
                InfectiousDiseases disease = new InfectiousDiseases();
                disease.setDiseaseName(diseaseDTO.getDiseaseName());
                disease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                disease.setDateResolved(diseaseDTO.getDateResolved());
                disease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                disease.setDescription(diseaseDTO.getDescription());
                disease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                disease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                disease.setStatus(diseaseDTO.getStatus());
                disease.setHealthProfile(savedProfile);
                infectiousDiseasesRepository.save(disease);
            }
        }

        // Create and save treatment history if provided
        if (healthProfileDTO.getTreatments() != null) {
            for (TreatmentHistoryDTO treatmentDTO : healthProfileDTO.getTreatments()) {
                TreatmentHistory treatment = new TreatmentHistory();
                treatment.setTreatmentType(treatmentDTO.getTreatmentType());
                treatment.setDescription(treatmentDTO.getDescription());
                treatment.setDoctorName(treatmentDTO.getDoctorName());
                treatment.setDateOfAdmission(treatmentDTO.getDateOfAdmission());
                treatment.setDateOfDischarge(treatmentDTO.getDateOfDischarge());
                treatment.setPlaceOfTreatment(treatmentDTO.getPlaceOfTreatment());
                treatment.setStatus(treatmentDTO.getStatus());
                treatment.setHealthProfile(savedProfile);
                treatmentHistoryRepository.save(treatment);
            }
        }

        // Create and save vision records if provided
        if (healthProfileDTO.getVision() != null) {
            for (VisionDTO visionDTO : healthProfileDTO.getVision()) {
                Vision vision = new Vision();
                vision.setVisionLeft(visionDTO.getVisionLeft());
                vision.setVisionRight(visionDTO.getVisionRight());
                vision.setVisionLeftWithGlass(visionDTO.getVisionLeftWithGlass());
                vision.setVisionRightWithGlass(visionDTO.getVisionRightWithGlass());
                vision.setVisionDescription(visionDTO.getVisionDescription());
                vision.setDateOfExamination(visionDTO.getDateOfExamination());
                vision.setHealthProfile(savedProfile);
                visionRepository.save(vision);
            }
        }

        // Create and save hearing records if provided
        if (healthProfileDTO.getHearing() != null) {
            for (HearingDTO hearingDTO : healthProfileDTO.getHearing()) {
                Hearing hearing = new Hearing();
                hearing.setLeftEar(hearingDTO.getLeftEar());
                hearing.setRightEar(hearingDTO.getRightEar());
                hearing.setDescription(hearingDTO.getDescription());
                hearing.setDateOfExamination(hearingDTO.getDateOfExamination());
                hearing.setHealthProfile(savedProfile);
                hearingRepository.save(hearing);
            }
        }        // Create and save vaccination history if provided
        if (healthProfileDTO.getVaccinationHistory() != null) {
            for (VaccinationHistoryDTO vaccinationDTO : healthProfileDTO.getVaccinationHistory()) {
                VaccinationHistory vaccination = new VaccinationHistory();
                vaccination.setVaccineName(vaccinationDTO.getVaccineName());
                vaccination.setDoseNumber(vaccinationDTO.getDoseNumber());
                vaccination.setManufacturer(vaccinationDTO.getManufacturer());
                vaccination.setDateOfVaccination(vaccinationDTO.getDateOfVaccination());
                vaccination.setPlaceOfVaccination(vaccinationDTO.getPlaceOfVaccination());
                vaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
                vaccination.setNotes(vaccinationDTO.getNotes());
                vaccination.setStatus(vaccinationDTO.isStatus());
                vaccination.setHealthProfile(savedProfile);
                
                // Set vaccination rule if provided
                if (vaccinationDTO.getRuleId() != null) {
                    VaccinationRule rule = vaccinationRuleRepository.findById(vaccinationDTO.getRuleId())
                            .orElse(null);
                    vaccination.setVaccinationRule(rule);
                }
                
                vaccinationHistoryRepository.save(vaccination);
            }
        }

        // Return the created health profile as DTO
        healthProfileDTO.setId(savedProfile.getId());
        healthProfileDTO.setCreatedAt(savedProfile.getCreatedAt());
        healthProfileDTO.setUpdatedAt(savedProfile.getUpdatedAt());
        healthProfileDTO.setStatus(savedProfile.getStatus());
        healthProfileDTO.setParentId(parent.getId());

        return healthProfileDTO;
    }

    /**
     * Get health profile by ID, ensuring the parent has access to it
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     * @return the health profile data
     */    public HealthProfileDTO getHealthProfileById(Long parentId, Long profileId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Health profile not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Parent is not associated with this student");
        }

        // Convert to DTO
        return convertToDTO(healthProfile);
    }

    /**
     * Get health profiles by student ID, ensuring the parent has access to them
     * @param parentId ID of the parent user
     * @param studentId ID of the student
     * @return list of health profiles for the student
     */
    public List<HealthProfileDTO> getHealthProfilesByStudentId(Long parentId, Long studentId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        // Validate student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, student)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Parent is not associated with this student");
        }

        // Get health profiles
        List<HealthProfile> healthProfiles = healthProfileRepository.findByStudentStudentIDAndParentId(studentId, parentId);

        // Convert to DTOs
        return healthProfiles.stream()
                .map(this::convertToDetailedDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get approved health profiles by student ID, ensuring the parent has access to them
     * @param parentId ID of the parent user
     * @param studentId ID of the student
     * @return list of approved health profiles for the student
     */
    public List<HealthProfileDTO> getApprovedHealthProfilesByStudentId(Long parentId, Long studentId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can access health profiles");
        }

        // Validate student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, student)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Parent is not associated with this student");
        }

        // Get approved health profiles only
        List<HealthProfile> healthProfiles = healthProfileRepository.findByStudentStudentIDAndParentId(studentId, parentId);
        
        // Filter for approved profiles only
        List<HealthProfile> approvedProfiles = healthProfiles.stream()
                .filter(profile -> profile.getStatus() == ProfileStatus.APPROVED)
                .collect(Collectors.toList());

        // Convert to DTOs
        return approvedProfiles.stream()
                .map(this::convertToDetailedDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update a health profile
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     * @param healthProfileDTO updated health profile data
     * @return updated health profile
     */
    public HealthProfileDTO updateHealthProfile(Long parentId, Long profileId, HealthProfileDTO healthProfileDTO) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can update health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Health profile not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Parent is not associated with this student");
        }

        // Check if profile can be updated (only PENDING profiles can be updated)
        if (healthProfile.getStatus() != ProfileStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only profiles with PENDING status can be updated");
        }        // Update basic profile information
        healthProfile.setWeight(healthProfileDTO.getWeight());
        healthProfile.setHeight(healthProfileDTO.getHeight());
        healthProfile.setNote(healthProfileDTO.getNote());
        healthProfile.setUpdatedAt(LocalDate.now());

        // Save updated profile
        HealthProfile updatedProfile = healthProfileRepository.save(healthProfile);        // Update allergies if provided
        if (healthProfileDTO.getAllergies() != null) {
            Set<Allergies> existingAllergies = healthProfile.getAllergies() != null ? 
                new HashSet<>(healthProfile.getAllergies()) : new HashSet<>();
            Set<Allergies> updatedAllergies = new HashSet<>(existingAllergies);
            
            // Process each allergy from DTO
            for (AllergiesDTO allergyDTO : healthProfileDTO.getAllergies()) {
                // Check if this is a new allergy (no ID) or doesn't exist in current allergies
                boolean isNewAllergy = allergyDTO.getId() == null || 
                    existingAllergies.stream().noneMatch(existing -> 
                        existing.getId().equals(allergyDTO.getId()) ||
                        (existing.getAllergyType().equalsIgnoreCase(allergyDTO.getAllergyType()) &&
                         existing.getOnsetDate().equals(allergyDTO.getOnsetDate()))
                    );
                
                if (isNewAllergy) {
                    // Create new allergy
                    Allergies newAllergy = new Allergies();
                    newAllergy.setAllergyType(allergyDTO.getAllergyType());
                    newAllergy.setDescription(allergyDTO.getDescription());
                    newAllergy.setStatus(allergyDTO.getStatus());
                    newAllergy.setOnsetDate(allergyDTO.getOnsetDate());
                    newAllergy.setHealthProfile(updatedProfile);
                    
                    // Save new allergy
                    Allergies savedAllergy = allergiesRepository.save(newAllergy);
                    updatedAllergies.add(savedAllergy);
                } else {
                    // Update existing allergy if needed
                    Allergies existingAllergy = existingAllergies.stream()
                        .filter(existing -> existing.getId().equals(allergyDTO.getId()) ||
                                (existing.getAllergyType().equalsIgnoreCase(allergyDTO.getAllergyType()) &&
                                 existing.getOnsetDate().equals(allergyDTO.getOnsetDate())))
                        .findFirst().orElse(null);
                    
                    if (existingAllergy != null) {
                        // Update fields if they have changed
                        existingAllergy.setDescription(allergyDTO.getDescription());
                        existingAllergy.setStatus(allergyDTO.getStatus());
                        allergiesRepository.save(existingAllergy);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setAllergies(updatedAllergies);
            // Save the updated profile with the allergies
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update chronic diseases if provided
        if (healthProfileDTO.getChronicDiseases() != null) {
            Set<ChronicDiseases> existingDiseases = healthProfile.getChronicDiseases() != null ? 
                new HashSet<>(healthProfile.getChronicDiseases()) : new HashSet<>();
            Set<ChronicDiseases> updatedDiseases = new HashSet<>(existingDiseases);
            
            // Process each chronic disease from DTO
            for (ChronicDiseasesDTO diseaseDTO : healthProfileDTO.getChronicDiseases()) {
                // Check if this is a new chronic disease (no ID) or doesn't exist in current diseases
                boolean isNewDisease = diseaseDTO.getId() == null || 
                    existingDiseases.stream().noneMatch(existing -> 
                        existing.getId().equals(diseaseDTO.getId()) ||
                        (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                         existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed()))
                    );
                
                if (isNewDisease) {
                    // Create new chronic disease
                    ChronicDiseases newDisease = new ChronicDiseases();
                    newDisease.setDiseaseName(diseaseDTO.getDiseaseName());
                    newDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                    newDisease.setDateResolved(diseaseDTO.getDateResolved());
                    newDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                    newDisease.setDescription(diseaseDTO.getDescription());
                    newDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                    newDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                    newDisease.setStatus(diseaseDTO.getStatus());
                    newDisease.setHealthProfile(updatedProfile);
                    
                    // Save new chronic disease
                    ChronicDiseases savedDisease = chronicDiseasesRepository.save(newDisease);
                    updatedDiseases.add(savedDisease);
                } else {
                    // Update existing chronic disease if needed
                    ChronicDiseases existingDisease = existingDiseases.stream()
                        .filter(existing -> existing.getId().equals(diseaseDTO.getId()) ||
                                (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                                 existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed())))
                        .findFirst().orElse(null);
                      if (existingDisease != null) {
                        // Update fields if they have changed
                        existingDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                        existingDisease.setDateResolved(diseaseDTO.getDateResolved());
                        existingDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                        existingDisease.setDescription(diseaseDTO.getDescription());
                        existingDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                        existingDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                        existingDisease.setStatus(diseaseDTO.getStatus());
                        chronicDiseasesRepository.save(existingDisease);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setChronicDiseases(updatedDiseases);
            // Save the updated profile with the chronic diseases
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update infectious diseases if provided
        if (healthProfileDTO.getInfectiousDiseases() != null) {
            List<InfectiousDiseases> existingDiseases = healthProfile.getInfectiousDiseases() != null ? 
                new ArrayList<>(healthProfile.getInfectiousDiseases()) : new ArrayList<>();
            List<InfectiousDiseases> updatedDiseases = new ArrayList<>(existingDiseases);
            
            for (InfectiousDiseasesDTO diseaseDTO : healthProfileDTO.getInfectiousDiseases()) {
                // Check if this is a new infectious disease (no ID or doesn't match existing)
                if (diseaseDTO.getId() == null || existingDiseases.stream()
                    .noneMatch(existing -> existing.getId().equals(diseaseDTO.getId()) ||
                              (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                               existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed())))) {
                    
                    // Create new infectious disease
                    InfectiousDiseases newDisease = new InfectiousDiseases();
                    newDisease.setDiseaseName(diseaseDTO.getDiseaseName());
                    newDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                    newDisease.setDateResolved(diseaseDTO.getDateResolved());
                    newDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                    newDisease.setDescription(diseaseDTO.getDescription());
                    newDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                    newDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                    newDisease.setStatus(diseaseDTO.getStatus());
                    newDisease.setHealthProfile(updatedProfile);
                    
                    // Save new infectious disease
                    InfectiousDiseases savedDisease = infectiousDiseasesRepository.save(newDisease);
                    updatedDiseases.add(savedDisease);
                } else {
                    // Update existing infectious disease if needed
                    InfectiousDiseases existingDisease = existingDiseases.stream()
                        .filter(existing -> existing.getId().equals(diseaseDTO.getId()) ||
                                (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                                 existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed())))
                        .findFirst().orElse(null);
                      if (existingDisease != null) {
                        // Update fields if they have changed
                        existingDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                        existingDisease.setDateResolved(diseaseDTO.getDateResolved());
                        existingDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                        existingDisease.setDescription(diseaseDTO.getDescription());
                        existingDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                        existingDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                        existingDisease.setStatus(diseaseDTO.getStatus());
                        infectiousDiseasesRepository.save(existingDisease);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setInfectiousDiseases(new HashSet<>(updatedDiseases));
            // Save the updated profile with the infectious diseases
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update treatment history if provided
        if (healthProfileDTO.getTreatments() != null) {
            List<TreatmentHistory> existingTreatments = healthProfile.getTreatments() != null ? 
                new ArrayList<>(healthProfile.getTreatments()) : new ArrayList<>();
            List<TreatmentHistory> updatedTreatments = new ArrayList<>(existingTreatments);
            
            for (TreatmentHistoryDTO treatmentDTO : healthProfileDTO.getTreatments()) {
                // Check if this is a new treatment (no ID or doesn't match existing)
                if (treatmentDTO.getId() == null || existingTreatments.stream()
                    .noneMatch(existing -> existing.getId().equals(treatmentDTO.getId()) ||
                              (existing.getTreatmentType().equalsIgnoreCase(treatmentDTO.getTreatmentType()) &&
                               existing.getDateOfAdmission().equals(treatmentDTO.getDateOfAdmission())))) {
                    
                    // Create new treatment
                    TreatmentHistory newTreatment = new TreatmentHistory();
                    newTreatment.setTreatmentType(treatmentDTO.getTreatmentType());
                    newTreatment.setDescription(treatmentDTO.getDescription());
                    newTreatment.setDoctorName(treatmentDTO.getDoctorName());
                    newTreatment.setDateOfAdmission(treatmentDTO.getDateOfAdmission());
                    newTreatment.setDateOfDischarge(treatmentDTO.getDateOfDischarge());
                    newTreatment.setPlaceOfTreatment(treatmentDTO.getPlaceOfTreatment());
                    newTreatment.setStatus(treatmentDTO.getStatus());
                    newTreatment.setHealthProfile(updatedProfile);
                    
                    // Save new treatment
                    TreatmentHistory savedTreatment = treatmentHistoryRepository.save(newTreatment);
                    updatedTreatments.add(savedTreatment);
                } else {
                    // Update existing treatment if needed
                    TreatmentHistory existingTreatment = existingTreatments.stream()
                        .filter(existing -> existing.getId().equals(treatmentDTO.getId()) ||
                                (existing.getTreatmentType().equalsIgnoreCase(treatmentDTO.getTreatmentType()) &&
                                 existing.getDateOfAdmission().equals(treatmentDTO.getDateOfAdmission())))
                        .findFirst().orElse(null);
                      if (existingTreatment != null) {
                        // Update fields if they have changed
                        existingTreatment.setDescription(treatmentDTO.getDescription());
                        existingTreatment.setDoctorName(treatmentDTO.getDoctorName());
                        existingTreatment.setDateOfAdmission(treatmentDTO.getDateOfAdmission());
                        existingTreatment.setDateOfDischarge(treatmentDTO.getDateOfDischarge());
                        existingTreatment.setPlaceOfTreatment(treatmentDTO.getPlaceOfTreatment());
                        existingTreatment.setStatus(treatmentDTO.getStatus());
                        treatmentHistoryRepository.save(existingTreatment);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setTreatments(new HashSet<>(updatedTreatments));
            // Save the updated profile with the treatments
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update vision records if provided
        if (healthProfileDTO.getVision() != null) {
            List<Vision> existingVision = healthProfile.getVision() != null ? 
                new ArrayList<>(healthProfile.getVision()) : new ArrayList<>();
            List<Vision> updatedVision = new ArrayList<>(existingVision);
            
            for (VisionDTO visionDTO : healthProfileDTO.getVision()) {
                // Check if this is a new vision record (no ID or doesn't match existing)
                if (visionDTO.getId() == null || existingVision.stream()
                    .noneMatch(existing -> existing.getId().equals(visionDTO.getId()) ||
                              existing.getDateOfExamination().equals(visionDTO.getDateOfExamination()))) {
                    
                    // Create new vision record
                    Vision newVision = new Vision();
                    newVision.setVisionLeft(visionDTO.getVisionLeft());
                    newVision.setVisionRight(visionDTO.getVisionRight());
                    newVision.setVisionLeftWithGlass(visionDTO.getVisionLeftWithGlass());
                    newVision.setVisionRightWithGlass(visionDTO.getVisionRightWithGlass());
                    newVision.setVisionDescription(visionDTO.getVisionDescription());
                    newVision.setDateOfExamination(visionDTO.getDateOfExamination());
                    newVision.setHealthProfile(updatedProfile);
                    
                    // Save new vision record
                    Vision savedVision = visionRepository.save(newVision);
                    updatedVision.add(savedVision);
                } else {
                    // Update existing vision record if needed
                    Vision existingVisionRecord = existingVision.stream()
                        .filter(existing -> existing.getId().equals(visionDTO.getId()) ||
                                existing.getDateOfExamination().equals(visionDTO.getDateOfExamination()))
                        .findFirst().orElse(null);
                      if (existingVisionRecord != null) {
                        // Update fields if they have changed
                        existingVisionRecord.setVisionLeft(visionDTO.getVisionLeft());
                        existingVisionRecord.setVisionRight(visionDTO.getVisionRight());
                        existingVisionRecord.setVisionLeftWithGlass(visionDTO.getVisionLeftWithGlass());
                        existingVisionRecord.setVisionRightWithGlass(visionDTO.getVisionRightWithGlass());
                        existingVisionRecord.setVisionDescription(visionDTO.getVisionDescription());
                        existingVisionRecord.setDateOfExamination(visionDTO.getDateOfExamination());
                        visionRepository.save(existingVisionRecord);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setVision(new HashSet<>(updatedVision));
            // Save the updated profile with the vision records
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update hearing records if provided
        if (healthProfileDTO.getHearing() != null) {
            List<Hearing> existingHearing = healthProfile.getHearing() != null ? 
                new ArrayList<>(healthProfile.getHearing()) : new ArrayList<>();
            List<Hearing> updatedHearing = new ArrayList<>(existingHearing);
            
            for (HearingDTO hearingDTO : healthProfileDTO.getHearing()) {
                // Check if this is a new hearing record (no ID or doesn't match existing)
                if (hearingDTO.getId() == null || existingHearing.stream()
                    .noneMatch(existing -> existing.getId().equals(hearingDTO.getId()) ||
                              existing.getDateOfExamination().equals(hearingDTO.getDateOfExamination()))) {
                    
                    // Create new hearing record
                    Hearing newHearing = new Hearing();
                    newHearing.setLeftEar(hearingDTO.getLeftEar());
                    newHearing.setRightEar(hearingDTO.getRightEar());
                    newHearing.setDescription(hearingDTO.getDescription());
                    newHearing.setDateOfExamination(hearingDTO.getDateOfExamination());
                    newHearing.setHealthProfile(updatedProfile);
                    
                    // Save new hearing record
                    Hearing savedHearing = hearingRepository.save(newHearing);
                    updatedHearing.add(savedHearing);
                } else {
                    // Update existing hearing record if needed
                    Hearing existingHearingRecord = existingHearing.stream()
                        .filter(existing -> existing.getId().equals(hearingDTO.getId()) ||
                                existing.getDateOfExamination().equals(hearingDTO.getDateOfExamination()))
                        .findFirst().orElse(null);
                      if (existingHearingRecord != null) {
                        // Update fields if they have changed
                        existingHearingRecord.setLeftEar(hearingDTO.getLeftEar());
                        existingHearingRecord.setRightEar(hearingDTO.getRightEar());
                        existingHearingRecord.setDescription(hearingDTO.getDescription());
                        existingHearingRecord.setDateOfExamination(hearingDTO.getDateOfExamination());
                        hearingRepository.save(existingHearingRecord);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setHearing(new HashSet<>(updatedHearing));
            // Save the updated profile with the hearing records
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update vaccination history if provided
        if (healthProfileDTO.getVaccinationHistory() != null) {
            List<VaccinationHistory> existingVaccinations = healthProfile.getVaccinationHistory() != null ? 
                new ArrayList<>(healthProfile.getVaccinationHistory()) : new ArrayList<>();
            List<VaccinationHistory> updatedVaccinations = new ArrayList<>(existingVaccinations);
            
            for (VaccinationHistoryDTO vaccinationDTO : healthProfileDTO.getVaccinationHistory()) {
                // Check if this is a new vaccination record (no ID or doesn't match existing)
                if (vaccinationDTO.getId() == null || existingVaccinations.stream()
                    .noneMatch(existing -> existing.getId().equals(vaccinationDTO.getId()) ||
                              (existing.getVaccineName().equalsIgnoreCase(vaccinationDTO.getVaccineName()) &&
                               existing.getDoseNumber() == vaccinationDTO.getDoseNumber() &&
                               existing.getDateOfVaccination().equals(vaccinationDTO.getDateOfVaccination())))) {
                      // Create new vaccination record
                    VaccinationHistory newVaccination = new VaccinationHistory();
                    newVaccination.setVaccineName(vaccinationDTO.getVaccineName());
                    newVaccination.setDoseNumber(vaccinationDTO.getDoseNumber());
                    newVaccination.setManufacturer(vaccinationDTO.getManufacturer());
                    newVaccination.setDateOfVaccination(vaccinationDTO.getDateOfVaccination());
                    newVaccination.setPlaceOfVaccination(vaccinationDTO.getPlaceOfVaccination());
                    newVaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
                    newVaccination.setNotes(vaccinationDTO.getNotes());
                    newVaccination.setStatus(vaccinationDTO.isStatus());
                    newVaccination.setHealthProfile(updatedProfile);
                    
                    // Set vaccination rule if provided
                    if (vaccinationDTO.getRuleId() != null) {
                        VaccinationRule rule = vaccinationRuleRepository.findById(vaccinationDTO.getRuleId())
                                .orElse(null);
                        newVaccination.setVaccinationRule(rule);
                    }
                    
                    // Save new vaccination record
                    VaccinationHistory savedVaccination = vaccinationHistoryRepository.save(newVaccination);
                    updatedVaccinations.add(savedVaccination);
                } else {
                    // Update existing vaccination record if needed
                    VaccinationHistory existingVaccination = existingVaccinations.stream()
                        .filter(existing -> existing.getId().equals(vaccinationDTO.getId()) ||
                                (existing.getVaccineName().equalsIgnoreCase(vaccinationDTO.getVaccineName()) &&
                                 existing.getDoseNumber() == vaccinationDTO.getDoseNumber() &&
                                 existing.getDateOfVaccination().equals(vaccinationDTO.getDateOfVaccination())))
                        .findFirst().orElse(null);                      if (existingVaccination != null) {
                        // Update fields if they have changed
                        existingVaccination.setManufacturer(vaccinationDTO.getManufacturer());
                        existingVaccination.setDateOfVaccination(vaccinationDTO.getDateOfVaccination());
                        existingVaccination.setPlaceOfVaccination(vaccinationDTO.getPlaceOfVaccination());
                        existingVaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
                        existingVaccination.setNotes(vaccinationDTO.getNotes());
                        existingVaccination.setStatus(vaccinationDTO.isStatus());
                        
                        // Update vaccination rule if provided
                        if (vaccinationDTO.getRuleId() != null) {
                            VaccinationRule rule = vaccinationRuleRepository.findById(vaccinationDTO.getRuleId())
                                    .orElse(null);
                            existingVaccination.setVaccinationRule(rule);
                        } else {
                            existingVaccination.setVaccinationRule(null);
                        }
                        
                        vaccinationHistoryRepository.save(existingVaccination);
                    }
                }
            }
            
            // Update the bidirectional relationship
            updatedProfile.setVaccinationHistory(new HashSet<>(updatedVaccinations));
            // Save the updated profile with the vaccination history
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        return convertToDetailedDTO(updatedProfile);
    }

    /**
     * Delete a health profile
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     */
    public void deleteHealthProfile(Long parentId, Long profileId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only parents can delete health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Health profile not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Parent is not associated with this student");
        }

        // Check if profile can be deleted (only PENDING profiles can be deleted)
        if (healthProfile.getStatus() != ProfileStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only profiles with PENDING status can be deleted");
        }

        // Delete the health profile (cascade will handle related entities)
        healthProfileRepository.delete(healthProfile);
    }

    /**
     * Convert HealthProfile entity to DTO
     * @param healthProfile the health profile entity
     * @return the health profile DTO
     */
    private HealthProfileDTO convertToDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setWeight(healthProfile.getWeight());
        dto.setHeight(healthProfile.getHeight());
        dto.setCreatedAt(healthProfile.getCreatedAt());
        dto.setUpdatedAt(healthProfile.getUpdatedAt());
        dto.setStatus(healthProfile.getStatus());
        dto.setNote(healthProfile.getNote());
        dto.setNurseNote(healthProfile.getNurseNote());
        dto.setStudentId(healthProfile.getStudent().getStudentID());

        if (healthProfile.getNurse() != null) {
            dto.setNurseId(healthProfile.getNurse().getId());
        }

        if (healthProfile.getParent() != null) {
            dto.setParentId(healthProfile.getParent().getId());
        }

        return dto;
    }

    /**
     * Convert HealthProfile entity to detailed DTO with all related data
     * @param healthProfile the health profile entity
     * @return the detailed health profile DTO
     */
    private HealthProfileDTO convertToDetailedDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setWeight(healthProfile.getWeight());
        dto.setHeight(healthProfile.getHeight());
        dto.setCreatedAt(healthProfile.getCreatedAt());
        dto.setUpdatedAt(healthProfile.getUpdatedAt());
        dto.setStatus(healthProfile.getStatus());
        dto.setNote(healthProfile.getNote());
        dto.setNurseNote(healthProfile.getNurseNote());
        dto.setStudentId(healthProfile.getStudent().getStudentID());

        if (healthProfile.getNurse() != null) {
            dto.setNurseId(healthProfile.getNurse().getId());
        }

        if (healthProfile.getParent() != null) {
            dto.setParentId(healthProfile.getParent().getId());
        }

        // Convert related entities to DTOs
        // Note: This is a simplified conversion. In a real implementation,
        // you might want to create proper DTOs for each related entity        // Convert allergies
        if (healthProfile.getAllergies() != null) {
            List<AllergiesDTO> allergiesDTOs = healthProfile.getAllergies().stream()
                    .map(allergy -> {
                        AllergiesDTO allergyDTO = new AllergiesDTO();
                        allergyDTO.setId(allergy.getId());
                        allergyDTO.setAllergyType(allergy.getAllergyType());
                        allergyDTO.setDescription(allergy.getDescription());
                        allergyDTO.setStatus(allergy.getStatus());
                        allergyDTO.setOnsetDate(allergy.getOnsetDate());
                        return allergyDTO;
                    })
                    .collect(Collectors.toList());
            dto.setAllergies(allergiesDTOs);
        }        // Convert chronic diseases
        if (healthProfile.getChronicDiseases() != null) {
            List<ChronicDiseasesDTO> chronicDiseasesDTOs = healthProfile.getChronicDiseases().stream()
                    .map(disease -> {
                        ChronicDiseasesDTO diseaseDTO = new ChronicDiseasesDTO();
                        diseaseDTO.setId(disease.getId());
                        diseaseDTO.setDiseaseName(disease.getDiseaseName());
                        diseaseDTO.setDateDiagnosed(disease.getDateDiagnosed());
                        diseaseDTO.setDateResolved(disease.getDateResolved());
                        diseaseDTO.setPlaceOfTreatment(disease.getPlaceOfTreatment());
                        diseaseDTO.setDescription(disease.getDescription());
                        diseaseDTO.setDateOfAdmission(disease.getDateOfAdmission());
                        diseaseDTO.setDateOfDischarge(disease.getDateOfDischarge());
                        diseaseDTO.setStatus(disease.getStatus());
                        return diseaseDTO;
                    })
                    .collect(Collectors.toList());
            dto.setChronicDiseases(chronicDiseasesDTOs);
        }        // Convert infectious diseases
        if (healthProfile.getInfectiousDiseases() != null) {
            List<InfectiousDiseasesDTO> infectiousDiseasesDTOs = healthProfile.getInfectiousDiseases().stream()
                    .map(disease -> {
                        InfectiousDiseasesDTO diseaseDTO = new InfectiousDiseasesDTO();
                        diseaseDTO.setId(disease.getId());
                        diseaseDTO.setDiseaseName(disease.getDiseaseName());
                        diseaseDTO.setDateDiagnosed(disease.getDateDiagnosed());
                        diseaseDTO.setDateResolved(disease.getDateResolved());
                        diseaseDTO.setPlaceOfTreatment(disease.getPlaceOfTreatment());
                        diseaseDTO.setDescription(disease.getDescription());
                        diseaseDTO.setDateOfAdmission(disease.getDateOfAdmission());
                        diseaseDTO.setDateOfDischarge(disease.getDateOfDischarge());
                        diseaseDTO.setStatus(disease.getStatus());
                        return diseaseDTO;
                    })
                    .collect(Collectors.toList());
            dto.setInfectiousDiseases(infectiousDiseasesDTOs);        }        // Convert treatment history
        if (healthProfile.getTreatments() != null) {
            List<TreatmentHistoryDTO> treatmentDTOs = healthProfile.getTreatments().stream()
                    .map(treatment -> {
                        TreatmentHistoryDTO treatmentDTO = new TreatmentHistoryDTO();
                        treatmentDTO.setId(treatment.getId());
                        treatmentDTO.setTreatmentType(treatment.getTreatmentType());
                        treatmentDTO.setDescription(treatment.getDescription());
                        treatmentDTO.setDoctorName(treatment.getDoctorName());
                        treatmentDTO.setDateOfAdmission(treatment.getDateOfAdmission());
                        treatmentDTO.setDateOfDischarge(treatment.getDateOfDischarge());
                        treatmentDTO.setPlaceOfTreatment(treatment.getPlaceOfTreatment());
                        treatmentDTO.setStatus(treatment.getStatus());
                        return treatmentDTO;
                    })
                    .collect(Collectors.toList());
            dto.setTreatments(treatmentDTOs);
        }        // Convert vision data
        if (healthProfile.getVision() != null) {
            List<VisionDTO> visionDTOs = healthProfile.getVision().stream()
                    .map(vision -> {
                        VisionDTO visionDTO = new VisionDTO();
                        visionDTO.setId(vision.getId());
                        visionDTO.setVisionLeft(vision.getVisionLeft());
                        visionDTO.setVisionRight(vision.getVisionRight());
                        visionDTO.setVisionLeftWithGlass(vision.getVisionLeftWithGlass());
                        visionDTO.setVisionRightWithGlass(vision.getVisionRightWithGlass());
                        visionDTO.setVisionDescription(vision.getVisionDescription());
                        visionDTO.setDateOfExamination(vision.getDateOfExamination());
                        return visionDTO;
                    })
                    .collect(Collectors.toList());
            dto.setVision(visionDTOs);
        }        // Convert hearing data
        if (healthProfile.getHearing() != null) {
            List<HearingDTO> hearingDTOs = healthProfile.getHearing().stream()
                    .map(hearing -> {
                        HearingDTO hearingDTO = new HearingDTO();
                        hearingDTO.setId(hearing.getId());
                        hearingDTO.setLeftEar(hearing.getLeftEar());
                        hearingDTO.setRightEar(hearing.getRightEar());
                        hearingDTO.setDescription(hearing.getDescription());
                        hearingDTO.setDateOfExamination(hearing.getDateOfExamination());
                        return hearingDTO;
                    })
                    .collect(Collectors.toList());
            dto.setHearing(hearingDTOs);
        }        // Convert vaccination history
        if (healthProfile.getVaccinationHistory() != null) {
            List<VaccinationHistoryDTO> vaccinationDTOs = healthProfile.getVaccinationHistory().stream()
                    .map(vaccination -> {
                        VaccinationHistoryDTO vaccinationDTO = new VaccinationHistoryDTO();
                        vaccinationDTO.setId(vaccination.getId());
                        vaccinationDTO.setVaccineName(vaccination.getVaccineName());
                        vaccinationDTO.setDoseNumber(vaccination.getDoseNumber());
                        vaccinationDTO.setManufacturer(vaccination.getManufacturer());
                        vaccinationDTO.setDateOfVaccination(vaccination.getDateOfVaccination());
                        vaccinationDTO.setPlaceOfVaccination(vaccination.getPlaceOfVaccination());
                        vaccinationDTO.setAdministeredBy(vaccination.getAdministeredBy());
                        vaccinationDTO.setNotes(vaccination.getNotes());
                        vaccinationDTO.setStatus(vaccination.isStatus());
                        
                        // Include vaccination rule ID if rule is associated
                        if (vaccination.getVaccinationRule() != null) {
                            vaccinationDTO.setRuleId(vaccination.getVaccinationRule().getId());
                        }
                        
                        return vaccinationDTO;
                    })
                    .collect(Collectors.toList());
            dto.setVaccinationHistory(vaccinationDTOs);
        }

        return dto;
    }

    /**
     * Check if a parent is related to a student
     * @param parent The parent user
     * @param student The student
     * @return true if the parent is related to the student, false otherwise
     */
    private boolean isParentRelatedToStudent(User parent, Student student) {
        // Check if the parent is either the mother or father of the student
        return (student.getMother() != null && student.getMother().getId().equals(parent.getId())) ||
               (student.getFather() != null && student.getFather().getId().equals(parent.getId()));
    }
}
