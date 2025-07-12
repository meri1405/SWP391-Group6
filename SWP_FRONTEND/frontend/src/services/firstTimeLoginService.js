import { sendOtpForPasswordChange, verifyOtpAndChangePasswordWithUsername } from "../api/userApi";

/**
 * Service for handling first-time login operations
 */
export class FirstTimeLoginService {
  /**
   * Send OTP to the user's email for password change
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async sendOtp(email) {
    try {
      const result = await sendOtpForPasswordChange(email);
      if (result.ok) {
        return {
          success: true,
          message: "Mã OTP đã được gửi đến email của bạn!"
        };
      } else {
        return {
          success: false,
          message: result.data?.message || "Không thể gửi OTP. Vui lòng thử lại."
        };
      }
    } catch {
      return {
        success: false,
        message: "Lỗi hệ thống. Vui lòng thử lại sau."
      };
    }
  }

  /**
   * Resend OTP to the user's email
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async resendOtp(email) {
    try {
      const result = await sendOtpForPasswordChange(email);
      if (result.ok) {
        return {
          success: true,
          message: "Mã OTP mới đã được gửi!"
        };
      } else {
        return {
          success: false,
          message: result.data?.message || "Không thể gửi lại OTP."
        };
      }
    } catch {
      return {
        success: false,
        message: "Lỗi hệ thống. Vui lòng thử lại sau."
      };
    }
  }

  /**
   * Verify OTP and change password with username
   * @param {string} email - User's email address
   * @param {string} otp - OTP code
   * @param {string} newPassword - New password
   * @param {string} username - New username
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async verifyOtpAndChangeCredentials(email, otp, newPassword, username) {
    try {
      const result = await verifyOtpAndChangePasswordWithUsername(
        email,
        otp,
        newPassword,
        username
      );

      if (result.ok) {
        return {
          success: true,
          message: "Đổi mật khẩu và tên đăng nhập thành công! Vui lòng đăng nhập lại."
        };
      } else {
        return {
          success: false,
          message: result.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn."
        };
      }
    } catch {
      return {
        success: false,
        message: "Lỗi hệ thống. Vui lòng thử lại sau."
      };
    }
  }
}
