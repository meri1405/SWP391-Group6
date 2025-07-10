package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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
    private String schoolYear;
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
    private Map<String, Object> skinResults;
    private Map<String, Object> respiratoryResults;
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
        dto.setSchoolYear(student.getSchoolYear());
        // Calculate age from date of birth
        if (student.getDob() != null) {
            dto.setStudentAge(java.time.Period.between(student.getDob(), LocalDate.now()).getYears());
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
        dto.setSkinResults(new HashMap<>());
        dto.setRespiratoryResults(new HashMap<>());
        dto.setGeneralHealthResults(new HashMap<>());
        
        // Process results by category
        for (HealthCheckResult result : results) {
            String category = result.getCategory().toString();
            
            // Add basic measurements to heightWeightResults
            dto.getHeightWeightResults().put("Cân nặng", result.getWeight() + " kg");
            dto.getHeightWeightResults().put("Chiều cao", result.getHeight() + " cm");
            if (result.getBmi() != null) {
                dto.getHeightWeightResults().put("BMI", String.format("%.2f", result.getBmi()));
            }
            
            // Process category-specific results using OneToOne relationships
            switch (category) {
                case "VISION":
                    // Vision-specific results
                    Map<String, Object> visionResults = dto.getVisionResults();
                    Vision vision = result.getVision();
                    if (vision != null) {
                        visionResults.put("Thị lực mắt trái", vision.getVisionLeft() + "/10");
                        visionResults.put("Thị lực mắt phải", vision.getVisionRight() + "/10");
                        if (vision.getVisionLeftWithGlass() > 0) {
                            visionResults.put("Thị lực mắt trái (có kính)", vision.getVisionLeftWithGlass() + "/10");
                        }
                        if (vision.getVisionRightWithGlass() > 0) {
                            visionResults.put("Thị lực mắt phải (có kính)", vision.getVisionRightWithGlass() + "/10");
                        }
                        if (vision.isNeedsGlasses()) {
                            visionResults.put("Cần đeo kính", "Có");
                        }
                        if (vision.getVisionDescription() != null) {
                            visionResults.put("Mô tả", vision.getVisionDescription());
                        }
                        if (vision.getRecommendations() != null) {
                            visionResults.put("Khuyến nghị", vision.getRecommendations());
                            dto.setRecommendations(vision.getRecommendations());
                        }
                        visionResults.put("Trạng thái", vision.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    }
                    visionResults.put("Kết quả", result.getStatus().toString());
                    break;
                    
                case "HEARING":
                    // Hearing-specific results
                    Map<String, Object> hearingResults = dto.getHearingResults();
                    Hearing hearing = result.getHearing();
                    if (hearing != null) {
                        hearingResults.put("Thính lực tai trái", hearing.getLeftEar());
                        hearingResults.put("Thính lực tai phải", hearing.getRightEar());
                        if (hearing.getDescription() != null) {
                            hearingResults.put("Mô tả", hearing.getDescription());
                        }
                        if (hearing.getRecommendations() != null) {
                            hearingResults.put("Khuyến nghị", hearing.getRecommendations());
                            dto.setRecommendations(hearing.getRecommendations());
                        }
                        hearingResults.put("Trạng thái", hearing.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    }
                    hearingResults.put("Kết quả", result.getStatus().toString());
                    break;
                    
                case "ORAL":
                    // Oral-specific results
                    Map<String, Object> dentalResults = dto.getDentalResults();
                    Oral oral = result.getOral();
                    if (oral != null) {
                        dentalResults.put("Răng", oral.getTeethCondition());
                        dentalResults.put("Nướu", oral.getGumsCondition());
                        dentalResults.put("Lưỡi", oral.getTongueCondition());
                        if (oral.getDescription() != null) {
                            dentalResults.put("Mô tả", oral.getDescription());
                        }
                        if (oral.getRecommendations() != null) {
                            dentalResults.put("Khuyến nghị", oral.getRecommendations());
                            dto.setRecommendations(oral.getRecommendations());
                        }
                        dentalResults.put("Trạng thái", oral.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    }
                    dentalResults.put("Kết quả", result.getStatus().toString());
                    break;
                    
                case "SKIN":
                    // Skin-specific results
                    Map<String, Object> skinResults = dto.getSkinResults();
                    Skin skin = result.getSkin();
                    if (skin != null) {
                        skinResults.put("Màu da", skin.getSkinColor());
                        skinResults.put("Phát ban", skin.isRashes() ? "Có" : "Không");
                        skinResults.put("Tổn thương da", skin.isLesions() ? "Có" : "Không");
                        skinResults.put("Chàm", skin.isEczema() ? "Có" : "Không");
                        skinResults.put("Khô da", skin.isDryness() ? "Có" : "Không");
                        if (skin.getDescription() != null) {
                            skinResults.put("Mô tả", skin.getDescription());
                        }
                        if (skin.getTreatment() != null) {
                            skinResults.put("Điều trị", skin.getTreatment());
                        }
                        if (skin.getRecommendations() != null) {
                            skinResults.put("Khuyến nghị", skin.getRecommendations());
                            dto.setRecommendations(skin.getRecommendations());
                        }
                        skinResults.put("Trạng thái", skin.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    }
                    skinResults.put("Kết quả", result.getStatus().toString());
                    break;
                    
                case "RESPIRATORY":
                    // Respiratory-specific results
                    Map<String, Object> respiratoryResults = dto.getRespiratoryResults();
                    Respiratory respiratory = result.getRespiratory();
                    if (respiratory != null) {
                        respiratoryResults.put("Tần số thở", String.valueOf(respiratory.getBreathingRate()));
                        respiratoryResults.put("Âm thanh thở", respiratory.getBreathingSound());
                        respiratoryResults.put("Khó thở", respiratory.isBreathingDifficulty() ? "Có" : "Không");
                        respiratoryResults.put("Ho", respiratory.isCough() ? "Có" : "Không");
                        respiratoryResults.put("Thở khò khè", respiratory.isWheezing() ? "Có" : "Không");
                        // Note: oxygenSaturation and treatment are not in the Respiratory model
                        // but they are in the DTO, so we'll skip them here
                        if (respiratory.getDescription() != null) {
                            respiratoryResults.put("Mô tả", respiratory.getDescription());
                        }
                        if (respiratory.getRecommendations() != null) {
                            respiratoryResults.put("Khuyến nghị", respiratory.getRecommendations());
                            dto.setRecommendations(respiratory.getRecommendations());
                        }
                        respiratoryResults.put("Trạng thái", respiratory.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    }
                    respiratoryResults.put("Kết quả", result.getStatus().toString());
                    break;
                    
                default:
                    // For other categories, add basic info to general results
                    Map<String, Object> generalResults = dto.getGeneralHealthResults();
                    generalResults.put("Cân nặng", result.getWeight() + " kg");
                    generalResults.put("Chiều cao", result.getHeight() + " cm");
                    if (result.getBmi() != null) {
                        generalResults.put("BMI", String.format("%.2f", result.getBmi()));
                    }
                    if (result.getResultNotes() != null && !result.getResultNotes().isEmpty()) {
                        generalResults.put("Ghi chú", result.getResultNotes());
                    }
                    if (result.getRecommendations() != null && !result.getRecommendations().isEmpty()) {
                        generalResults.put("Khuyến nghị", result.getRecommendations());
                        dto.setRecommendations(result.getRecommendations());
                    }
                    generalResults.put("Trạng thái", result.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    break;
            }
            
            // Add notes and recommendations from the result
            if (result.getResultNotes() != null && !result.getResultNotes().isEmpty()) {
                dto.setConclusions(result.getResultNotes());
            }
            
            if (result.getRecommendations() != null && !result.getRecommendations().isEmpty() && dto.getRecommendations() == null) {
                dto.setRecommendations(result.getRecommendations());
            }
        }
        
        return dto;
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
        
        // Skin results
        if (!skinResults.isEmpty()) {
            html.append("<h3>Kiểm tra da:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : skinResults.entrySet()) {
                html.append("<li><strong>").append(entry.getKey()).append(":</strong> ");
                html.append(entry.getValue()).append("</li>");
            }
            html.append("</ul>");
        }
        
        // Respiratory results
        if (!respiratoryResults.isEmpty()) {
            html.append("<h3>Kiểm tra hô hấp:</h3>");
            html.append("<ul>");
            for (Map.Entry<String, Object> entry : respiratoryResults.entrySet()) {
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
