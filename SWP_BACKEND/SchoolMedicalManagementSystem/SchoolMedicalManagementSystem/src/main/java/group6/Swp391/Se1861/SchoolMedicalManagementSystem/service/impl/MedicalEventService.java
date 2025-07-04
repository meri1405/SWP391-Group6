package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalEventResponseDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyUsageDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.EventType;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.SeverityLevel;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalEventService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    private final IMedicalSupplyService medicalSupplyService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final INotificationService notificationService;

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

        // Get the student's health profile (one-to-one relationship)
        HealthProfile healthProfile = student.getHealthProfile();
        if (healthProfile == null) {
            throw new ResourceNotFoundException("No health profile found for student id: " + student.getStudentID());
        }

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
                List<MedicalSupply> suppliesOrderedByExpiration = medicalSupplyRepository.findByNameAndEnabledOrderByExpirationDateAsc(supplyName);

                // Check if there are enough total supplies available in display units
                BigDecimal totalAvailable = suppliesOrderedByExpiration.stream()
                        .map(MedicalSupply::getDisplayQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        
                if (totalAvailable.compareTo(BigDecimal.valueOf(supplyUsage.getQuantityUsed())) < 0) {
                    throw new IllegalArgumentException("Not enough supply available. Requested: " +
                        supplyUsage.getQuantityUsed() + ", Total Available: " + totalAvailable);
                }

                // Consume supplies starting with those closest to expiration
                BigDecimal remainingToUse = BigDecimal.valueOf(supplyUsage.getQuantityUsed());
                MedicalSupply usedSupply = null;  // To reference in the event supply record

                for (MedicalSupply supply : suppliesOrderedByExpiration) {
                    if (remainingToUse.compareTo(BigDecimal.ZERO) <= 0) break;

                    BigDecimal quantityToUseFromThisSupply = remainingToUse.min(supply.getDisplayQuantity());
                    
                    // First update the displayQuantity
                    BigDecimal newDisplayQuantity = supply.getDisplayQuantity().subtract(quantityToUseFromThisSupply);
                    supply.setDisplayQuantity(newDisplayQuantity);
                    
                    // Calculate the equivalent base quantity to subtract
                    // We need the ratio of base units per display unit to do the conversion
                    BigDecimal baseUnitToSubtract;
                    if (supply.getDisplayQuantity().add(quantityToUseFromThisSupply).compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal baseUnitsPerDisplayUnit = supply.getQuantityInBaseUnit().divide(
                            supply.getDisplayQuantity().add(quantityToUseFromThisSupply), 8, BigDecimal.ROUND_HALF_UP);
                        baseUnitToSubtract = quantityToUseFromThisSupply.multiply(baseUnitsPerDisplayUnit);
                    } else {
                        // If we're using all remaining quantity, just subtract all remaining base units
                        baseUnitToSubtract = supply.getQuantityInBaseUnit();
                    }
                    
                    // Update the base quantity
                    medicalSupplyService.subtractFromQuantityInBaseUnit(supply.getId(), baseUnitToSubtract);

                    // If this is the first or only supply used, reference it in the event
                    if (usedSupply == null) {
                        usedSupply = supply;
                    }

                    remainingToUse = remainingToUse.subtract(quantityToUseFromThisSupply);

                    // Create medical event supply record for each supply used
                    MedicalEventSupply eventSupply = new MedicalEventSupply();
                    eventSupply.setMedicalEvent(savedEvent);
                    eventSupply.setMedicalSupply(supply);
                    eventSupply.setQuantityUsed(quantityToUseFromThisSupply.intValue()); // Store the display quantity used
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
            String title = "Cảnh Báo Sự Kiện Y Tế: " + student.getFirstName() + " " + student.getLastName();
            StringBuilder message = new StringBuilder();
            message.append("<p>Con của bạn đã gặp phải một sự kiện y tế</p>");
            message.append("<p><strong>Loại:</strong> ").append(translateEventType(medicalEvent.getEventType())).append("</p>");
            message.append("<p><strong>Mức độ nghiêm trọng:</strong> ").append(translateSeverityLevel(medicalEvent.getSeverityLevel())).append("</p>");
            message.append("<p><strong>Thời gian:</strong> ").append(medicalEvent.getOccurrenceTime()).append("</p>");
            message.append("<p><strong>Địa điểm:</strong> ").append(medicalEvent.getLocation()).append("</p>");

            if (medicalEvent.getFirstAidActions() != null && !medicalEvent.getFirstAidActions().isEmpty()) {
                message.append("<p><strong>Sơ cứu đã thực hiện:</strong> ").append(medicalEvent.getFirstAidActions()).append("</p>");
            }

            message.append("<p>Vui lòng liên hệ với y tá trường để biết thêm thông tin.</p>");

            // Create notification using the correct method from INotificationService
            notificationService.createMedicalEventNotification(
                medicalEvent,
                "MEDICAL_EVENT",
                title,
                message.toString()
            );
        }
    }

    private String translateEventType(EventType eventType) {
        switch (eventType) {
            case FEVER:
                return "Sốt";
            case ACCIDENT:
                return "Tai nạn";
            case FALL:
                return "Té ngã";
            case EPIDEMIC:
                return "Dịch bệnh";
            case OTHER_EMERGENCY:
                return "Cấp cứu khác";
            default:
                return eventType.toString();
        }
    }

    private String translateSeverityLevel(SeverityLevel severityLevel) {
        switch (severityLevel) {
            case MILD:
                return "Nhẹ";
            case MODERATE:
                return "Trung bình";
            case SEVERE:
                return "Nặng";
            default:
                return severityLevel.toString();
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
            String title = "Cập Nhật Sự Kiện Y Tế: " + student.getFirstName() + " " + student.getLastName();
            StringBuilder message = new StringBuilder();
            message.append("<p>Sự kiện y tế của con bạn đã được xử lý bởi đội ngũ y tế.</p>");
            message.append("<p><strong>Loại:</strong> ").append(translateEventType(medicalEvent.getEventType())).append("</p>");
            message.append("<p><strong>Xử lý lúc:</strong> ").append(medicalEvent.getProcessedTime()).append("</p>");
            message.append("<p><strong>Xử lý bởi:</strong> ").append(medicalEvent.getProcessedBy().getFullName()).append("</p>");

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
                    supply.getDisplayUnit(),
                    eventSupply.getQuantityUsed()
            ));
        }
        responseDTO.setSuppliesUsed(suppliesUsed);

        return responseDTO;
    }
}
