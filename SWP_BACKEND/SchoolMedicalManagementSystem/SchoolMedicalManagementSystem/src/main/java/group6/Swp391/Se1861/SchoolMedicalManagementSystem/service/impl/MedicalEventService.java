package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventResponseDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyUsageDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalEventService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalEventService implements IMedicalEventService {

    private final MedicalEventRepository medicalEventRepository;
    private final MedicalEventSupplyRepository medicalEventSupplyRepository;
    private final MedicalSupplyRepository medicalSupplyRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final INotificationService notificationService;
    private final HealthProfileRepository healthProfileRepository;

    @Override
    @Transactional
    public MedicalEventResponseDTO createMedicalEvent(MedicalEventRequestDTO requestDTO, Long createdById) {
        // Find student
        Student student = studentRepository.findById(requestDTO.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + requestDTO.getStudentId()));

        // Find user who created the event
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + createdById));

        // Create medical event
        MedicalEvent medicalEvent = new MedicalEvent();
        medicalEvent.setEventType(requestDTO.getEventType());
        medicalEvent.setOccurrenceTime(requestDTO.getOccurrenceTime());
        medicalEvent.setLocation(requestDTO.getLocation());
        medicalEvent.setSymptoms(requestDTO.getSymptoms());
        medicalEvent.setSeverityLevel(requestDTO.getSeverityLevel());
        medicalEvent.setFirstAidActions(requestDTO.getFirstAidActions());
        medicalEvent.setStudent(student);
        medicalEvent.setCreatedBy(createdBy);

        // Find the student's most recent APPROVED health profile and associate the event with it
        HealthProfile healthProfile = healthProfileRepository.findTopByStudentAndStatusOrderByCreatedAtDesc(student, ProfileStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("No approved health profile found for student id: " + student.getStudentID()));

        medicalEvent.setHealthProfile(healthProfile);

        // Save medical event
        MedicalEvent savedEvent = medicalEventRepository.save(medicalEvent);

        // Process supplies used
        if (requestDTO.getSuppliesUsed() != null && !requestDTO.getSuppliesUsed().isEmpty()) {
            for (MedicalSupplyUsageDTO supplyUsage : requestDTO.getSuppliesUsed()) {
                // Get the requested supply to determine its name
                MedicalSupply referencedSupply = medicalSupplyRepository.findById(supplyUsage.getMedicalSupplyId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medical supply not found with id: " + supplyUsage.getMedicalSupplyId()));

                // Find all supplies with the same name, ordered by expiration date (nearest expiration first)
                String supplyName = referencedSupply.getName();
                List<MedicalSupply> suppliesOrderedByExpiration = medicalSupplyRepository.findByNameOrderByExpirationDateAsc(supplyName);

                // Check if there are enough total supplies available
                int totalAvailable = suppliesOrderedByExpiration.stream().mapToInt(MedicalSupply::getQuantity).sum();
                if (totalAvailable < supplyUsage.getQuantityUsed()) {
                    throw new IllegalArgumentException("Not enough supply available. Requested: " +
                        supplyUsage.getQuantityUsed() + ", Total Available: " + totalAvailable);
                }

                // Consume supplies starting with those closest to expiration
                int remainingToUse = supplyUsage.getQuantityUsed();
                MedicalSupply usedSupply = null;  // To reference in the event supply record

                for (MedicalSupply supply : suppliesOrderedByExpiration) {
                    if (remainingToUse <= 0) break;

                    int quantityToUseFromThisSupply = Math.min(remainingToUse, supply.getQuantity());

                    // Update this supply's quantity
                    supply.setQuantity(supply.getQuantity() - quantityToUseFromThisSupply);
                    medicalSupplyRepository.save(supply);

                    // If this is the first or only supply used, reference it in the event
                    if (usedSupply == null) {
                        usedSupply = supply;
                    }

                    remainingToUse -= quantityToUseFromThisSupply;

                    // Create medical event supply record for each supply used
                    MedicalEventSupply eventSupply = new MedicalEventSupply();
                    eventSupply.setMedicalEvent(savedEvent);
                    eventSupply.setMedicalSupply(supply);
                    eventSupply.setQuantityUsed(quantityToUseFromThisSupply);
                    medicalEventSupplyRepository.save(eventSupply);
                }
            }
        }

        // Send notification to parent based on severity
        sendNotificationToParent(savedEvent);

        return convertToResponseDTO(savedEvent);
    }

    private void sendNotificationToParent(MedicalEvent medicalEvent) {
        // Get parent of the student
        Student student = medicalEvent.getStudent();
        User parent = student.getParent();

        if (parent != null) {
            String title = "Medical Event Alert: " + student.getFirstName() + " " + student.getLastName();
            StringBuilder message = new StringBuilder();
            message.append("Your child has experienced a medical event.\n");
            message.append("Type: ").append(medicalEvent.getEventType()).append("\n");
            message.append("Severity: ").append(medicalEvent.getSeverityLevel()).append("\n");
            message.append("Time: ").append(medicalEvent.getOccurrenceTime()).append("\n");
            message.append("Location: ").append(medicalEvent.getLocation()).append("\n");

            if (medicalEvent.getFirstAidActions() != null && !medicalEvent.getFirstAidActions().isEmpty()) {
                message.append("First Aid Provided: ").append(medicalEvent.getFirstAidActions()).append("\n");
            }

            message.append("Please respond or contact the school nurse for more information.");

            // Create notification using the correct method from INotificationService
            notificationService.createMedicalEventNotification(
                medicalEvent,
                "MEDICAL_EVENT",
                title,
                message.toString()
            );
        }
    }

    @Override
    public MedicalEventResponseDTO getMedicalEventById(Long id) {
        MedicalEvent medicalEvent = medicalEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical event not found with id: " + id));
        return convertToResponseDTO(medicalEvent);
    }

    @Override
    public List<MedicalEventResponseDTO> getAllMedicalEvents() {
        return medicalEventRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalEventResponseDTO> getMedicalEventsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        return medicalEventRepository.findByStudentOrderByOccurrenceTimeDesc(student).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalEventResponseDTO> getMedicalEventsByEventType(EventType eventType) {
        return medicalEventRepository.findByEventType(eventType).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalEventResponseDTO> getMedicalEventsBySeverityLevel(SeverityLevel severityLevel) {
        return medicalEventRepository.findBySeverityLevel(severityLevel).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalEventResponseDTO> getMedicalEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return medicalEventRepository.findByOccurrenceTimeBetween(startDate, endDate).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalEventResponseDTO> getMedicalEventsByClass(String className) {
        return medicalEventRepository.findByClassName(className).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalEventResponseDTO> getMedicalEventsByClassAndDateRange(String className, LocalDateTime startDate, LocalDateTime endDate) {
        return medicalEventRepository.findByClassNameAndDateRange(className, startDate, endDate).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicalEventResponseDTO processMedicalEvent(Long id, Long processedById) {
        MedicalEvent medicalEvent = medicalEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical event not found with id: " + id));

        User processedBy = userRepository.findById(processedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + processedById));

        medicalEvent.setProcessed(true);
        medicalEvent.setProcessedTime(LocalDateTime.now());
        medicalEvent.setProcessedBy(processedBy);

        MedicalEvent updatedEvent = medicalEventRepository.save(medicalEvent);

        // Send notification to parent that the event has been processed
        sendProcessedNotificationToParent(updatedEvent);

        return convertToResponseDTO(updatedEvent);
    }

    private void sendProcessedNotificationToParent(MedicalEvent medicalEvent) {
        Student student = medicalEvent.getStudent();
        User parent = student.getParent();

        if (parent != null) {
            String title = "Medical Event Update: " + student.getFirstName() + " " + student.getLastName();
            StringBuilder message = new StringBuilder();
            message.append("The medical event for your child has been processed by our medical staff.\n");
            message.append("Type: ").append(medicalEvent.getEventType()).append("\n");
            message.append("Processed at: ").append(medicalEvent.getProcessedTime()).append("\n");
            message.append("Processed by: ").append(medicalEvent.getProcessedBy().getFullName()).append("\n");

            // Create notification using the correct method from INotificationService
            notificationService.createMedicalEventNotification(
                medicalEvent,
                "MEDICAL_EVENT_PROCESSED",
                title,
                message.toString()
            );
        }
    }

    @Override
    public List<MedicalEventResponseDTO> getPendingMedicalEvents() {
        return medicalEventRepository.findByProcessed(false).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    private MedicalEventResponseDTO convertToResponseDTO(MedicalEvent medicalEvent) {
        MedicalEventResponseDTO responseDTO = new MedicalEventResponseDTO();
        responseDTO.setId(medicalEvent.getId());
        responseDTO.setEventType(medicalEvent.getEventType());
        responseDTO.setOccurrenceTime(medicalEvent.getOccurrenceTime());
        responseDTO.setLocation(medicalEvent.getLocation());
        responseDTO.setSymptoms(medicalEvent.getSymptoms());
        responseDTO.setSeverityLevel(medicalEvent.getSeverityLevel());
        responseDTO.setFirstAidActions(medicalEvent.getFirstAidActions());
        responseDTO.setProcessed(medicalEvent.isProcessed());
        responseDTO.setProcessedTime(medicalEvent.getProcessedTime());
        responseDTO.setCreatedAt(medicalEvent.getCreatedAt());
        responseDTO.setUpdatedAt(medicalEvent.getUpdatedAt());

        // Set student info
        Student student = medicalEvent.getStudent();
        if (student != null) {
            responseDTO.setStudent(new MedicalEventResponseDTO.StudentBasicInfoDTO(
                    student.getStudentID(),
                    student.getFirstName(),
                    student.getLastName(),
                    student.getClassName()
            ));
        }

        // Set processed by user info
        User processedBy = medicalEvent.getProcessedBy();
        if (processedBy != null) {
            responseDTO.setProcessedBy(new MedicalEventResponseDTO.UserBasicInfoDTO(
                    processedBy.getId(),
                    processedBy.getUsername(),
                    processedBy.getFullName()
            ));
        }

        // Set created by user info
        User createdBy = medicalEvent.getCreatedBy();
        if (createdBy != null) {
            responseDTO.setCreatedBy(new MedicalEventResponseDTO.UserBasicInfoDTO(
                    createdBy.getId(),
                    createdBy.getUsername(),
                    createdBy.getFullName()
            ));
        }

        // Set supplies used
        List<MedicalEventResponseDTO.MedicalSupplyUsageResponseDTO> suppliesUsed = new ArrayList<>();
        for (MedicalEventSupply eventSupply : medicalEvent.getSuppliesUsed()) {
            MedicalSupply supply = eventSupply.getMedicalSupply();
            suppliesUsed.add(new MedicalEventResponseDTO.MedicalSupplyUsageResponseDTO(
                    eventSupply.getId(),
                    supply.getId(),
                    supply.getName(),
                    supply.getUnit(),
                    eventSupply.getQuantityUsed()
            ));
        }
        responseDTO.setSuppliesUsed(suppliesUsed);

        return responseDTO;
    }
}
