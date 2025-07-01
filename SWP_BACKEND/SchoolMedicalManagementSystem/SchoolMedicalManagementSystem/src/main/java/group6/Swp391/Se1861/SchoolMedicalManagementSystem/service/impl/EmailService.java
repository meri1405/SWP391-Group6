package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IEmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService implements IEmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Override
    public boolean sendSimpleEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }
    
    @Override
    public boolean sendPasswordResetOtp(String to, String otp) {
        String subject = "[Y TẾ HỌC ĐƯỜNG] - Mã Xác Thực OTP Đặt Lại Mật Khẩu";

        String content = "Kính chào Quý phụ huynh/học sinh,\n\n" +
                "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên Hệ Thống Quản Lý Y Tế Trường Học. " +
                "Để đảm bảo an toàn và bảo mật thông tin, bạn cần sử dụng mã xác thực (OTP - One-Time Password) dưới đây để tiếp tục quá trình đặt lại mật khẩu:\n\n" +
                "Mã OTP của bạn: " + otp + "\n\n" +
                "Lưu ý:\n" +
                "- Mã OTP này chỉ có hiệu lực trong vòng 15 phút kể từ thời điểm email này được gửi.\n" +
                "- Mỗi mã OTP chỉ được sử dụng một lần duy nhất để đảm bảo tính bảo mật cho tài khoản.\n\n" +
                "Sau khi nhập đúng mã OTP, bạn sẽ được hướng dẫn để thiết lập lại mật khẩu mới.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Trong trường hợp nghi ngờ có người khác cố ý truy cập vào tài khoản của bạn, hãy liên hệ ngay với bộ phận hỗ trợ của hệ thống để được xử lý kịp thời.\n\n" +
                "Mọi thắc mắc hoặc cần hỗ trợ, bạn có thể liên hệ với cán bộ y tế nhà trường hoặc qua các kênh hỗ trợ chính thức của hệ thống.\n\n" +
                "Trân trọng cảm ơn,\n" +
                "Ban Quản Trị\n" +
                "Hệ Thống Quản Lý Y Tế Trường Học";
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, false); // false = text/plain
            
            mailSender.send(mimeMessage);
            logger.info("Password reset OTP sent to: {}", to);
            return true;
        } catch (MessagingException e) {
            logger.error("Failed to send password reset OTP to {}: {}", to, e.getMessage());
            return false;
        }
    }
} 