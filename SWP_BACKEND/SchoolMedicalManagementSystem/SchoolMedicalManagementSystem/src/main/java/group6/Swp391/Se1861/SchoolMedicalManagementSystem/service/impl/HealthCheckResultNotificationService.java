package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultNotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckResultRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckResultNotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthCheckResultNotificationService implements IHealthCheckResultNotificationService {

    private final IHealthCheckCampaignService healthCheckCampaignService;
    private final HealthCheckCampaignRepository healthCheckCampaignRepository;
    private final HealthCheckResultRepository healthCheckResultRepository;
    private final StudentRepository studentRepository;

    @Override
    public Map<String, Object> sendHealthCheckResultNotifications(User nurse, HealthCheckResultNotificationDTO request) {
        try {
            // First, fetch the campaign entity
            HealthCheckCampaign campaign = healthCheckCampaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new RuntimeException("Campaign not found with ID: " + request.getCampaignId()));
            
            // Convert string IDs to Long IDs
            List<Long> studentIds = null;
            if (request.getStudentIds() != null) {
                studentIds = request.getStudentIds().stream()
                        .map(Long::valueOf)
                        .collect(Collectors.toList());
            }
            
            // Delegate to the existing method in HealthCheckCampaignService
            int sentCount = healthCheckCampaignService.sendHealthCheckResultsToParents(
                campaign,
                studentIds,
                request.getMessageTemplate()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Health check results sent successfully");
            result.put("sentCount", sentCount);
            
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to send health check results: " + e.getMessage());
            result.put("sentCount", 0);
            
            return result;
        }
    }
    
    @Override
    public String generateHealthCheckResultMessagePreview(Long campaignId, String studentId, String customTemplate) {
        try {
            // Convert studentId from String to Long
            Long studentIdLong = Long.valueOf(studentId);
            
            // Get the campaign
            HealthCheckCampaign campaign = healthCheckCampaignRepository.findById(campaignId)
                    .orElseThrow(() -> new RuntimeException("Campaign not found with ID: " + campaignId));
            
            // Find the student
            Student student = studentRepository.findById(studentIdLong)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
            
            // Get health check results for this student in this campaign
            List<HealthCheckResult> results = healthCheckResultRepository.findByStudentAndForm_Campaign(student, campaign);
            
            if (results.isEmpty()) {
                return "Chưa có kết quả khám sức khỏe cho học sinh này.";
            }
            
            // Generate a simple message preview
            StringBuilder messageBuilder = new StringBuilder();
            
            if (customTemplate != null && !customTemplate.trim().isEmpty()) {
                messageBuilder.append(customTemplate);
            } else {
                // Default message template
                messageBuilder.append("Kết quả khám sức khỏe cho học sinh: ")
                             .append(student.getFirstName()).append(" ").append(student.getLastName())
                             .append("\nĐợt khám: ").append(campaign.getName())
                             .append("\nNgày khám: ").append(campaign.getStartDate())
                             .append("\n\nKết quả chi tiết:\n");
                
                // Add basic result summary
                if (results.isEmpty()) {
                    messageBuilder.append("- Chưa có kết quả khám");
                } else {
                    messageBuilder.append("- Đã hoàn thành khám sức khỏe");
                    messageBuilder.append("\n- Số hạng mục đã khám: ").append(results.size());
                }
                
                messageBuilder.append("\n\nVui lòng liên hệ y tế trường để biết thêm chi tiết.");
            }
            
            return messageBuilder.toString();
            
        } catch (Exception e) {
            return "Lỗi khi tạo xem trước tin nhắn: " + e.getMessage();
        }
    }
}
