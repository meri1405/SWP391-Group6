package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Vision;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Hearing;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Oral;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Skin;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Respiratory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DTO for sending health check results to parents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckResultDTO {
    // Basic student information
    private Long studentId;
    private String studentName;
    private String studentClass;
    private Integer studentAge;
    
    // Campaign information
    private Long campaignId;
    private String campaignName;
    private String campaignDescription;
    
    // Results by category
    private Map<String, Object> visionResults;
    private Map<String, Object> dentalResults;
    private Map<String, Object> heightWeightResults;
    private Map<String, Object> hearingResults;
    private Map<String, Object> generalHealthResults;
    
    // Additional information
    private String conclusions;
    private String recommendations;
    private String customMessage;
    
    /**
     * Factory method to create a DTO from model objects
     */
    public static HealthCheckResultDTO fromEntities(Student student, HealthCheckCampaign campaign, List<HealthCheckResult> results) {
        HealthCheckResultDTO dto = new HealthCheckResultDTO();
        
        // Set student information
        dto.setStudentId(student.getStudentID());
        dto.setStudentName(student.getFullName());
        dto.setStudentClass(student.getClassName());
        // Calculate age from date of birth
        if (student.getDob() != null) {
            dto.setStudentAge(java.time.Period.between(student.getDob(), java.time.LocalDate.now()).getYears());
        }
        
        // Set campaign information
        dto.setCampaignId(campaign.getId());
        dto.setCampaignName(campaign.getName());
        dto.setCampaignDescription(campaign.getDescription());
        
        // Initialize result maps
        dto.setVisionResults(new HashMap<>());
        dto.setDentalResults(new HashMap<>());
        dto.setHeightWeightResults(new HashMap<>());
        dto.setHearingResults(new HashMap<>());
        dto.setGeneralHealthResults(new HashMap<>());
        
        // Process results by category
        for (HealthCheckResult result : results) {
            String category = result.getCategory().toString();
            
            // Add basic measurements for all results
            Map<String, Object> categoryResults = getCategoryResults(dto, category);
            
            // Add weight and height to height_weight category
            if ("VISION".equals(category)) {
                // Vision-specific results from linked Vision table
                if (!result.getVisionResults().isEmpty()) {
                    Vision vision = result.getVisionResults().get(0);
                    categoryResults.put("Thị lực mắt trái", vision.getVisionLeft() + "/10");
                    categoryResults.put("Thị lực mắt phải", vision.getVisionRight() + "/10");
                    if (vision.getVisionLeftWithGlass() > 0) {
                        categoryResults.put("Thị lực mắt trái (có kính)", vision.getVisionLeftWithGlass() + "/10");
                    }
                    if (vision.getVisionRightWithGlass() > 0) {
                        categoryResults.put("Thị lực mắt phải (có kính)", vision.getVisionRightWithGlass() + "/10");
                    }
                }
                categoryResults.put("Kết quả", result.getStatus().toString());
            } else if ("HEARING".equals(category)) {
                // Hearing-specific results from linked Hearing table
                if (!result.getHearingResults().isEmpty()) {
                    Hearing hearing = result.getHearingResults().get(0);
                    categoryResults.put("Thính lực tai trái", hearing.getLeftEar());
                    categoryResults.put("Thính lực tai phải", hearing.getRightEar());
                    if (hearing.getHearingAcuity() != null) {
                        categoryResults.put("Độ nhạy thính giác", hearing.getHearingAcuity());
                    }
                    if (hearing.getTympanometry() != null) {
                        categoryResults.put("Đo thính lực màng nhĩ", hearing.getTympanometry());
                    }
                }
                categoryResults.put("Kết quả", result.getStatus().toString());
            } else if ("ORAL".equals(category)) {
                // Oral-specific results from linked Oral table
                if (!result.getOralResults().isEmpty()) {
                    Oral oral = result.getOralResults().get(0);
                    categoryResults.put("Răng", oral.getTeethCondition());
                    categoryResults.put("Nướu", oral.getGumsCondition());
                    categoryResults.put("Lưỡi", oral.getTongueCondition());
                    if (oral.getOralHygiene() != null) {
                        categoryResults.put("Vệ sinh răng miệng", oral.getOralHygiene());
                    }
                    categoryResults.put("Số sâu răng", String.valueOf(oral.getCavitiesCount()));
                }
                categoryResults.put("Kết quả", result.getStatus().toString());
            } else if ("SKIN".equals(category)) {
                // Skin-specific results from linked Skin table
                if (!result.getSkinResults().isEmpty()) {
                    Skin skin = result.getSkinResults().get(0);
                    categoryResults.put("Màu da", skin.getSkinColor());
                    categoryResults.put("Phát ban", skin.isRashes() ? "Có" : "Không");
                    categoryResults.put("Tổn thương da", skin.isLesions() ? "Có" : "Không");
                    categoryResults.put("Chàm", skin.isEczema() ? "Có" : "Không");
                    categoryResults.put("Khô da", skin.isDryness() ? "Có" : "Không");
                }
                categoryResults.put("Kết quả", result.getStatus().toString());
            } else if ("RESPIRATORY".equals(category)) {
                // Respiratory-specific results from linked Respiratory table
                if (!result.getRespiratoryResults().isEmpty()) {
                    Respiratory respiratory = result.getRespiratoryResults().get(0);
                    categoryResults.put("Tần số thở", String.valueOf(respiratory.getBreathingRate()));
                    categoryResults.put("Âm thanh thở", respiratory.getBreathingSound());
                    categoryResults.put("Khó thở", respiratory.isBreathingDifficulty() ? "Có" : "Không");
                    categoryResults.put("Ho", respiratory.isCough() ? "Có" : "Không");
                    categoryResults.put("Thở khò khè", respiratory.isWheezing() ? "Có" : "Không");
                    if (respiratory.getOxygenSaturation() != null) {
                        categoryResults.put("Độ bão hòa oxy", respiratory.getOxygenSaturation() + "%");
                    }
                }
                categoryResults.put("Kết quả", result.getStatus().toString());
            } else {
                // For other categories, add weight and height
                categoryResults.put("Cân nặng", result.getWeight() + " kg");
                categoryResults.put("Chiều cao", result.getHeight() + " cm");
                if (result.getBmi() != null) {
                    categoryResults.put("BMI", String.format("%.2f", result.getBmi()));
                }
            }
            
            // Add notes and recommendations
            if (result.getResultNotes() != null && !result.getResultNotes().isEmpty()) {
                categoryResults.put("Ghi chú", result.getResultNotes());
            }
            
            if (result.getRecommendations() != null && !result.getRecommendations().isEmpty()) {
                dto.setRecommendations(result.getRecommendations());
            }
            
            // Check for abnormal status
            if (result.isAbnormal()) {
                categoryResults.put("Trạng thái", "Cần theo dõi");
            } else {
                categoryResults.put("Trạng thái", "Bình thường");
            }
        }
        
        return dto;
    }
    
    /**
     * Helper method to get the appropriate category results map
     */
    private static Map<String, Object> getCategoryResults(HealthCheckResultDTO dto, String category) {
        switch (category.toLowerCase()) {
            case "vision":
                return dto.getVisionResults();
            case "oral":
                return dto.getDentalResults();
            case "hearing":
                return dto.getHearingResults();
            default:
                return dto.getGeneralHealthResults();
        }
    }
    
    /**
     * Generate HTML content for notification
     */
    public String generateHtmlContent() {
        StringBuilder html = new StringBuilder();
        
        html.append("<p><strong>Kính gửi phụ huynh,</strong></p>");
        html.append("<p>Kết quả khám sức khỏe của học sinh <strong>").append(studentName).append("</strong> ");
        html.append("trong chiến dịch '<strong>").append(campaignName).append("</strong>' đã hoàn thành.</p>");
        
        // Add custom message if present
        if (customMessage != null && !customMessage.isEmpty()) {
            html.append("<p>").append(customMessage).append("</p>");
        }
        
        html.append("<h3>Thông tin học sinh:</h3>");
        html.append("<ul>");
        html.append("<li><strong>Họ và tên:</strong> ").append(studentName).append("</li>");
        html.append("<li><strong>Lớp:</strong> ").append(studentClass).append("</li>");
        html.append("<li><strong>Tuổi:</strong> ").append(studentAge).append("</li>");
        html.append("</ul>");
        
        // Height and Weight results
        if (!heightWeightResults.isEmpty()) {
            html.append("<h3>Chiều cao / Cân nặng:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : heightWeightResults.entrySet()) {
                html.append("<li><strong>").append(entry.getKey()).append(":</strong> ");
                html.append(entry.getValue()).append("</li>");
            }
            html.append("</ul>");
        }
        
        // Vision results
        if (!visionResults.isEmpty()) {
            html.append("<h3>Thị lực:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : visionResults.entrySet()) {
                html.append("<li><strong>").append(entry.getKey()).append(":</strong> ");
                html.append(entry.getValue()).append("</li>");
            }
            html.append("</ul>");
        }
        
        // Dental results
        if (!dentalResults.isEmpty()) {
            html.append("<h3>Kiểm tra răng miệng:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : dentalResults.entrySet()) {
                html.append("<li><strong>").append(entry.getKey()).append(":</strong> ");
                html.append(entry.getValue()).append("</li>");
            }
            html.append("</ul>");
        }
        
        // Hearing results
        if (!hearingResults.isEmpty()) {
            html.append("<h3>Kiểm tra thính lực:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : hearingResults.entrySet()) {
                html.append("<li><strong>").append(entry.getKey()).append(":</strong> ");
                html.append(entry.getValue()).append("</li>");
            }
            html.append("</ul>");
        }
        
        // General health results
        if (!generalHealthResults.isEmpty()) {
            html.append("<h3>Kiểm tra sức khỏe tổng quát:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : generalHealthResults.entrySet()) {
                if (!entry.getKey().equalsIgnoreCase("conclusion") && 
                    !entry.getKey().equalsIgnoreCase("conclusions") &&
                    !entry.getKey().equalsIgnoreCase("recommendation") && 
                    !entry.getKey().equalsIgnoreCase("recommendations")) {
                    
                    html.append("<li><strong>").append(entry.getKey()).append(":</strong> ");
                    html.append(entry.getValue()).append("</li>");
                }
            }
            html.append("</ul>");
        }
        
        // Conclusions
        if (conclusions != null && !conclusions.isEmpty()) {
            html.append("<h3>Kết luận:</h3>");
            html.append("<p>").append(conclusions).append("</p>");
        }
        
        // Recommendations
        if (recommendations != null && !recommendations.isEmpty()) {
            html.append("<h3>Khuyến nghị:</h3>");
            html.append("<p>").append(recommendations).append("</p>");
        }
        
        html.append("<p>Vui lòng liên hệ với y tá trường nếu bạn có bất kỳ câu hỏi nào.</p>");
        html.append("<p><em>Trân trọng,<br>Y tá trường</em></p>");
        
        return html.toString();
    }
}
