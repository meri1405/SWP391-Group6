package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccinationScheduledTasks {

    private final INotificationService notificationService;
    private final VaccinationCampaignRepository campaignRepository;
    private final VaccinationFormRepository formRepository;
    private final UserRepository userRepository;

    /**
     * Scheduled task to mark expired vaccination forms
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void markExpiredVaccinationForms() {
        try {
            log.info("Starting scheduled task: markExpiredVaccinationForms");
            
            LocalDateTime expiredDate = LocalDateTime.now().minusHours(48);
            
            List<VaccinationForm> expiredForms = formRepository.findByConfirmationStatusAndSentDateIsNotNull(VaccinationForm.ConfirmationStatus.PENDING)
                    .stream()
                    .filter(form -> form.getSentDate() != null && form.getSentDate().isBefore(expiredDate))
                    .collect(Collectors.toList());

            for (VaccinationForm form : expiredForms) {
                form.setConfirmationStatus(VaccinationForm.ConfirmationStatus.EXPIRED);
                
                // Notify nurse about expired form
                String studentName = form.getStudent().getFullName();
                notificationService.createVaccinationFormExpiryNotification(
                        form.getCreatedBy(),
                        studentName
                );
            }

            if (!expiredForms.isEmpty()) {
                formRepository.saveAll(expiredForms);
                log.info("Marked {} forms as expired", expiredForms.size());
            }
            
            log.info("Completed scheduled task: markExpiredVaccinationForms");
        } catch (Exception e) {
            log.error("Error in scheduled task markExpiredVaccinationForms: ", e);
        }
    }

    /**
     * Scheduled task to check vaccination campaigns for reminders and auto-rejection
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void checkVaccinationCampaignDeadlines() {
        try {
            log.info("Starting scheduled task: checkVaccinationCampaignDeadlines");
            
            LocalDateTime now = LocalDateTime.now();
            
            // Get all pending campaigns
            List<VaccinationCampaign> pendingCampaigns = campaignRepository.findByStatus(VaccinationCampaign.CampaignStatus.PENDING);
            
            for (VaccinationCampaign campaign : pendingCampaigns) {
                LocalDateTime createdAt = campaign.getCreatedDate();
                long hoursElapsed = ChronoUnit.HOURS.between(createdAt, now);
                
                // Debug logging for campaign timing
                System.out.println("DEBUG - Campaign ID: " + campaign.getId());
                System.out.println("DEBUG - Campaign Name: " + campaign.getName());
                System.out.println("DEBUG - Created At: " + createdAt);
                System.out.println("DEBUG - Current Time: " + now);
                System.out.println("DEBUG - Hours Elapsed: " + hoursElapsed);
                System.out.println("DEBUG - Status: " + campaign.getStatus());
                System.out.println("DEBUG - Should auto-reject? " + (hoursElapsed >= 24));
                System.out.println("DEBUG - Should send reminder? " + (hoursElapsed >= 12 && !campaign.getReminderSent()));
                System.out.println("------------------");
                
                if (hoursElapsed >= 24) {
                    // Auto-reject after 24 hours
                    log.info("Auto-rejecting campaign {} after 24 hours", campaign.getId());
                    autoRejectCampaign(campaign);
                } else if (hoursElapsed >= 12 && !campaign.getReminderSent()) {
                    // Send reminder after 12 hours
                    log.info("Sending reminder for campaign {} after 12 hours", campaign.getId());
                    sendCampaignReminderToManagers(campaign);
                    campaign.setReminderSent(true);
                    campaignRepository.save(campaign);
                }
            }
            
            log.info("Completed scheduled task: checkVaccinationCampaignDeadlines");
        } catch (Exception e) {
            log.error("Error in scheduled task checkVaccinationCampaignDeadlines: ", e);
        }
    }

    /**
     * Scheduled task to check vaccination forms for reminders and auto-rejection
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void checkVaccinationFormDeadlines() {
        try {
            log.info("Starting scheduled task: checkVaccinationFormDeadlines");
            
            LocalDateTime now = LocalDateTime.now();
            
            // Get all pending forms that have been sent to parents
            List<VaccinationForm> pendingForms = formRepository.findByConfirmationStatusAndSentDateIsNotNull(
                VaccinationForm.ConfirmationStatus.PENDING);
            
            for (VaccinationForm form : pendingForms) {
                LocalDateTime sentDate = form.getSentDate();
                if (sentDate != null) {
                    long hoursElapsed = ChronoUnit.HOURS.between(sentDate, now);
                    
                    if (hoursElapsed >= 48) {
                        // Auto-reject after 48 hours
                        log.info("Auto-rejecting form {} after 48 hours", form.getId());
                        autoRejectVaccinationForm(form);
                    } else if (hoursElapsed >= 24 && !form.getReminderSent()) {
                        // Send reminder after 24 hours
                        log.info("Sending reminder for form {} after 24 hours", form.getId());
                        sendFormReminderToParent(form);
                        form.setReminderSent(true);
                        formRepository.save(form);
                    }
                }
            }
            
            log.info("Completed scheduled task: checkVaccinationFormDeadlines");
        } catch (Exception e) {
            log.error("Error in scheduled task checkVaccinationFormDeadlines: ", e);
        }
    }

    /**
     * Auto-reject vaccination campaign after 24 hours
     */
    @Transactional
    public void autoRejectCampaign(VaccinationCampaign campaign) {
        try {
            String autoRejectReason = "Chiến dịch tiêm chủng bị từ chối tự động do quá thời hạn phê duyệt (24 giờ). " +
                    "Vui lòng tạo lại chiến dịch mới nếu cần thiết.";
            
            campaign.setStatus(VaccinationCampaign.CampaignStatus.REJECTED);
            campaign.setRejectionReason(autoRejectReason);
            campaign.setRejectedDate(LocalDateTime.now());
            campaignRepository.save(campaign);
            
            // Notify the school nurse who created the campaign
            User schoolNurse = campaign.getCreatedBy();
            if (schoolNurse != null) {
                notificationService.createCampaignRejectionNotification(
                    schoolNurse,
                    campaign.getName(),
                    autoRejectReason
                );
            }
            
            log.info("Auto-rejected campaign {} due to 24-hour deadline", campaign.getId());
        } catch (Exception e) {
            log.error("Error auto-rejecting campaign {}: ", campaign.getId(), e);
        }
    }

    /**
     * Send reminder to managers about pending campaign approval
     */
    private void sendCampaignReminderToManagers(VaccinationCampaign campaign) {
        try {
            // Get all managers
            List<User> managers = userRepository.findByRole_RoleName("MANAGER");
            
            String title = "Nhắc nhở: Chiến dịch tiêm chủng chờ phê duyệt";
            String message = String.format(
                "<p>Kính gửi Quý Ban Giám hiệu,</p>" +
                "<p>Chiến dịch tiêm chủng <strong>%s</strong> đã được tạo từ 12 giờ trước và hiện đang chờ phê duyệt.</p>" +
                "<p><strong>Thông tin chiến dịch:</strong></p>" +
                "<ul>" +
                "<li>Tên chiến dịch: %s</li>" +
                "<li>Loại vắc-xin: %s</li>" +
                "<li>Ngày dự kiến: %s</li>" +
                "<li>Người tạo: %s</li>" +
                "</ul>" +
                "<p>Vui lòng đăng nhập hệ thống để xem xét và phê duyệt chiến dịch trong vòng 12 giờ tới để tránh bị từ chối tự động.</p>" +
                "<p>Trân trọng,</p>" +
                "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>",
                campaign.getName(),
                campaign.getName(),
                campaign.getVaccineName(),
                campaign.getScheduledDate() != null ? campaign.getScheduledDate().toString() : "Chưa xác định",
                campaign.getCreatedBy() != null ? campaign.getCreatedBy().getFullName() : "Không xác định"
            );
            
            for (User manager : managers) {
                notificationService.createGeneralNotification(
                    manager,
                    title,
                    message,
                    "VACCINATION_CAMPAIGN_REMINDER"
                );
            }
            
            log.info("Sent reminder to {} managers for campaign {}", managers.size(), campaign.getId());
        } catch (Exception e) {
            log.error("Error sending campaign reminder for campaign {}: ", campaign.getId(), e);
        }
    }

    /**
     * Auto-reject vaccination form after 48 hours
     */
    @Transactional
    public void autoRejectVaccinationForm(VaccinationForm form) {
        try {
            String autoRejectReason = "Phiếu đồng ý tiêm chủng bị từ chối tự động do quá thời hạn phản hồi (48 giờ).";
            
            form.setConfirmationStatus(VaccinationForm.ConfirmationStatus.DECLINED);
            form.setParentNotes(autoRejectReason);
            form.setResponseDate(LocalDateTime.now());
            formRepository.save(form);
            
            // Notify the school nurse
            User schoolNurse = form.getCampaign().getCreatedBy();
            if (schoolNurse != null) {
                notificationService.createVaccinationFormDeclineNotification(
                    schoolNurse,
                    form.getStudent().getFullName(),
                    form.getCampaign().getVaccineName(),
                    autoRejectReason
                );
            }
            
            log.info("Auto-rejected form {} due to 48-hour deadline", form.getId());
        } catch (Exception e) {
            log.error("Error auto-rejecting form {}: ", form.getId(), e);
        }
    }

    /**
     * Send reminder to parent about pending vaccination form
     */
    private void sendFormReminderToParent(VaccinationForm form) {
        try {
            User parent = form.getStudent().getParent();
            if (parent != null) {
                String title = "Nhắc nhở: Phiếu đồng ý tiêm chủng chờ phản hồi";
                String message = String.format(
                    "<p>Kính gửi Quý phụ huynh,</p>" +
                    "<p>Phiếu đồng ý tiêm chủng cho học sinh <strong>%s</strong> đã được gửi từ 24 giờ trước và hiện đang chờ phản hồi của Quý phụ huynh.</p>" +
                    "<p><strong>Thông tin tiêm chủng:</strong></p>" +
                    "<ul>" +
                    "<li>Học sinh: %s</li>" +
                    "<li>Loại vắc-xin: %s</li>" +
                    "<li>Ngày tiêm dự kiến: %s</li>" +
                    "<li>Địa điểm: %s</li>" +
                    "</ul>" +
                    "<p>Vui lòng đăng nhập hệ thống để xác nhận đồng ý hoặc từ chối trong vòng 24 giờ tới để tránh bị từ chối tự động.</p>" +
                    "<p>Trân trọng,</p>" +
                    "<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>",
                    form.getStudent().getFullName(),
                    form.getStudent().getFullName(),
                    form.getCampaign().getVaccineName(),
                    form.getCampaign().getScheduledDate() != null ?
                        form.getCampaign().getScheduledDate().toString() : "Chưa xác định",
                    form.getCampaign().getLocation() != null ?
                        form.getCampaign().getLocation() : "Chưa xác định"
                );
                
                notificationService.createGeneralNotification(
                    parent,
                    title,
                    message,
                    "VACCINATION_FORM_REMINDER"
                );
                
                log.info("Sent reminder to parent {} for form {}", parent.getId(), form.getId());
            }
        } catch (Exception e) {
            log.error("Error sending form reminder for form {}: ", form.getId(), e);
        }
    }

    /**
     * Alternative scheduled task that runs daily at 2 AM
     * Uncomment this and comment the above if you prefer daily execution
     */
    // @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    // public void markExpiredVaccinationFormsDaily() {
    //     try {
    //         log.info("Starting daily scheduled task: markExpiredVaccinationForms");
    //         vaccinationFormService.markFormsAsExpired();
    //         log.info("Completed daily scheduled task: markExpiredVaccinationForms");
    //     } catch (Exception e) {
    //         log.error("Error in daily scheduled task markExpiredVaccinationForms: ", e);
    //     }
    // }
}
