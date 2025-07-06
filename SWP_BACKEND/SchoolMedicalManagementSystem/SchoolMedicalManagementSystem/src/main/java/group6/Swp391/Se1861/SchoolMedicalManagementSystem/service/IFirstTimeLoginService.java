package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.PasswordResetRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ResetPasswordRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MessageResponse;

/**
 * Service interface để xử lý logic đăng nhập lần đầu và đổi mật khẩu
 */
public interface IFirstTimeLoginService {

    /**
     * Kiểm tra xem người dùng có cần đổi mật khẩu lần đầu không
     * @param request Yêu cầu kiểm tra đăng nhập lần đầu (reuse PasswordResetRequest)
     * @return MessageResponse với thông tin trạng thái
     */
    MessageResponse checkFirstLogin(PasswordResetRequest request);

    /**
     * Gửi OTP đến email để xác thực việc đổi mật khẩu lần đầu
     * @param request Yêu cầu gửi OTP (sử dụng PasswordResetRequest)
     * @return MessageResponse với thông tin kết quả
     */
    MessageResponse sendOtpForPasswordChange(PasswordResetRequest request);

    /**
     * Xác thực OTP và đổi mật khẩu lần đầu
     * @param request Yêu cầu xác thực OTP và đổi mật khẩu (sử dụng ResetPasswordRequest)
     * @return MessageResponse với thông tin kết quả
     */
    MessageResponse verifyOtpAndChangePassword(ResetPasswordRequest request);

    /**
     * Tự động dọn dẹp các OTP tokens đã hết hạn
     * @return Số lượng tokens đã xóa
     */
    int cleanupExpiredTokens();
}
