package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileEventDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfileEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthProfileEventRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthProfileEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class HealthProfileEventService implements IHealthProfileEventService {

    @Autowired
    private HealthProfileEventRepository healthProfileEventRepository;

    @Override
    public void logEvent(HealthProfile healthProfile, User modifiedByUser, 
                        HealthProfileEvent.ActionType actionType, String fieldChanged, 
                        String oldValue, String newValue) {
        HealthProfileEvent event = new HealthProfileEvent();
        event.setHealthProfile(healthProfile);
        event.setModifiedByUser(modifiedByUser);
        event.setActionType(actionType);
        event.setFieldChanged(fieldChanged);
        event.setOldValue(oldValue);
        event.setNewValue(newValue);
        event.setModifiedAt(LocalDateTime.now());
        
        healthProfileEventRepository.save(event);
    }

    @Override
    public void logCreateEvent(HealthProfile healthProfile, User modifiedByUser) {
        logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.CREATE, 
                "Hồ sơ", null, "Tạo hồ sơ");
    }

    @Override
    public void logUpdateEvent(HealthProfile healthProfile, User modifiedByUser, 
                              String fieldChanged, String oldValue, String newValue) {
        logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.UPDATE, 
                fieldChanged, oldValue, newValue);
    }

    @Override
    public void logDeleteEvent(HealthProfile healthProfile, User modifiedByUser) {
        logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.DELETE, 
                "Hồ sơ", "Hồ sơ hoạt động", "Xóa hồ sơ");
    }

    @Override
    public void logApproveEvent(HealthProfile healthProfile, User modifiedByUser, String nurseNote) {
        logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.APPROVE, 
                "Trạng thái", "Đang chờ duyệt", "Đã duyệt");
        
        // Also log nurse note if provided
        if (nurseNote != null && !nurseNote.trim().isEmpty()) {
            logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.UPDATE, 
                    "Ghi chú", null, nurseNote);
        }
    }

    @Override
    public void logRejectEvent(HealthProfile healthProfile, User modifiedByUser, String rejectionReason) {
        logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.REJECT, 
                "Trạng thái", "Đang chờ duyệt", "Từ chối");
        
        // Also log rejection reason
        if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            logEvent(healthProfile, modifiedByUser, HealthProfileEvent.ActionType.UPDATE, 
                    "Ghi chú", null, rejectionReason);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthProfileEventDTO> getEventsByHealthProfile(Long healthProfileId) {
        return healthProfileEventRepository.findByHealthProfileIdOrderByModifiedAtDesc(healthProfileId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthProfileEventDTO> getEventsByUser(Long userId) {
        return healthProfileEventRepository.findByModifiedByUserOrderByModifiedAtDesc(
                new User() {{ setId(userId); }})
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthProfileEventDTO> getEventsByActionType(HealthProfileEvent.ActionType actionType) {
        return healthProfileEventRepository.findByActionTypeOrderByModifiedAtDesc(actionType)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthProfileEventDTO> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return healthProfileEventRepository.findByModifiedAtBetweenOrderByModifiedAtDesc(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthProfileEventDTO> getRecentEventsByHealthProfile(Long healthProfileId, int limit) {
        List<HealthProfileEventDTO> events = getEventsByHealthProfile(healthProfileId);
        return events.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countEventsByHealthProfile(Long healthProfileId) {
        HealthProfile healthProfile = new HealthProfile();
        healthProfile.setId(healthProfileId);
        return healthProfileEventRepository.countByHealthProfile(healthProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getEventStatistics(LocalDateTime startDate, LocalDateTime endDate, String groupBy) {
        Map<String, Object> statistics = new HashMap<>();
        
        // If no dates provided, use last 30 days
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        // Total count
        Long totalEvents = healthProfileEventRepository.countEventsByDateRange(startDate, endDate);
        statistics.put("totalEvents", totalEvents != null ? totalEvents : 0L);
        
        // Group by logic
        if ("ACTION_TYPE".equalsIgnoreCase(groupBy)) {
            List<Object[]> actionTypeStats = healthProfileEventRepository.countEventsByActionType(startDate, endDate);
            Map<String, Long> actionTypeCounts = new HashMap<>();
            for (Object[] row : actionTypeStats) {
                actionTypeCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
            statistics.put("byActionType", actionTypeCounts);
        } else if ("USER".equalsIgnoreCase(groupBy)) {
            List<Object[]> userStats = healthProfileEventRepository.countEventsByUser(startDate, endDate);
            Map<String, Long> userCounts = new HashMap<>();
            for (Object[] row : userStats) {
                userCounts.put(row[0] != null ? row[0].toString() : "Unknown", ((Number) row[1]).longValue());
            }
            statistics.put("byUser", userCounts);
        } else if ("DATE".equalsIgnoreCase(groupBy)) {
            List<Object[]> dateStats = healthProfileEventRepository.countEventsByDate(startDate, endDate);
            Map<String, Long> dateCounts = new HashMap<>();
            for (Object[] row : dateStats) {
                dateCounts.put(row[0] != null ? row[0].toString() : "Unknown", ((Number) row[1]).longValue());
            }
            statistics.put("byDate", dateCounts);
        } else {
            // Default: provide all groupings
            List<Object[]> actionTypeStats = healthProfileEventRepository.countEventsByActionType(startDate, endDate);
            Map<String, Long> actionTypeCounts = new HashMap<>();
            for (Object[] row : actionTypeStats) {
                actionTypeCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
            statistics.put("byActionType", actionTypeCounts);
        }
        
        statistics.put("startDate", startDate.toString());
        statistics.put("endDate", endDate.toString());
        
        return statistics;
    }

    private HealthProfileEventDTO convertToDTO(HealthProfileEvent event) {
        HealthProfileEventDTO dto = new HealthProfileEventDTO();
        dto.setId(event.getId());
        dto.setHealthProfileId(event.getHealthProfile().getId());
        dto.setModifiedByUserId(event.getModifiedByUser().getId());
        dto.setModifiedByUserName(event.getModifiedByUser().getFullName());
        dto.setActionType(event.getActionType());
        dto.setFieldChanged(event.getFieldChanged());
        dto.setOldValue(event.getOldValue());
        dto.setNewValue(event.getNewValue());
        dto.setModifiedAt(event.getModifiedAt());
        return dto;
    }
}
