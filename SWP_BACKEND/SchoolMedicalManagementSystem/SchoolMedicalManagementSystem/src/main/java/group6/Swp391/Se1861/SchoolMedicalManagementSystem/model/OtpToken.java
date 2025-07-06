package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho mã OTP được sử dụng cho việc đổi mật khẩu lần đầu
 * Mỗi OTP có thời gian hết hạn và chỉ có thể sử dụng một lần
 */
@Entity
@Table(name = "otp_tokens")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public class OtpToken {
    
    /** ID duy nhất của OTP token - khóa chính */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Long id;

    /** Người dùng liên quan đến OTP này */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Mã OTP (6 chữ số) */
    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    /** Email nhận OTP */
    @Column(name = "email", nullable = false)
    private String email;

    /** Thời gian tạo OTP - tự động cập nhật */
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** Thời gian hết hạn OTP (mặc định 5 phút) */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Trạng thái OTP đã được sử dụng chưa */
    @Column(name = "used", nullable = false)
    private Boolean used = false;

    /** Loại OTP (PASSWORD_CHANGE, PASSWORD_RESET, etc.) */
    @Column(name = "token_type", nullable = false)
    private String tokenType;

    /**
     * Constructor với các tham số cần thiết
     */
    public OtpToken(User user, String otpCode, String email, LocalDateTime expiresAt, String tokenType) {
        this.user = user;
        this.otpCode = otpCode;
        this.email = email;
        this.expiresAt = expiresAt;
        this.tokenType = tokenType;
        this.used = false;
    }

    /**
     * Kiểm tra OTP có hết hạn không
     * @return true nếu OTP đã hết hạn
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    /**
     * Kiểm tra OTP có hợp lệ không (chưa sử dụng và chưa hết hạn)
     * @return true nếu OTP hợp lệ
     */
    public boolean isValid() {
        return !this.used && !isExpired();
    }

    /**
     * Đánh dấu OTP đã được sử dụng
     */
    public void markAsUsed() {
        this.used = true;
    }
}
