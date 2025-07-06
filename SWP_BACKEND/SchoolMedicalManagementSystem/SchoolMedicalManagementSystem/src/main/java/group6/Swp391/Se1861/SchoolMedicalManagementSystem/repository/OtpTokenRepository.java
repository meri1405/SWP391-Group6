package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.OtpToken;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository để quản lý các OTP tokens
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    /**
     * Tìm OTP token hợp lệ theo email và mã OTP
     * @param email Email của người dùng
     * @param otpCode Mã OTP
     * @return Optional OtpToken nếu tìm thấy
     */
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email AND o.otpCode = :otpCode AND o.used = false AND o.expiresAt > :currentTime")
    Optional<OtpToken> findValidOtpByEmailAndCode(@Param("email") String email, 
                                                  @Param("otpCode") String otpCode, 
                                                  @Param("currentTime") LocalDateTime currentTime);

    /**
     * Tìm tất cả OTP tokens của một người dùng
     * @param user Người dùng
     * @return Danh sách OTP tokens
     */
    List<OtpToken> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Tìm OTP tokens theo email
     * @param email Email của người dùng
     * @return Danh sách OTP tokens
     */
    List<OtpToken> findByEmailOrderByCreatedAtDesc(String email);

    /**
     * Tìm OTP token mới nhất của người dùng theo loại token
     * @param user Người dùng
     * @param tokenType Loại token
     * @return Optional OtpToken nếu tìm thấy
     */
    Optional<OtpToken> findFirstByUserAndTokenTypeOrderByCreatedAtDesc(User user, String tokenType);

    /**
     * Tìm OTP token mới nhất theo email và loại token
     * @param email Email của người dùng
     * @param tokenType Loại token
     * @return Optional OtpToken nếu tìm thấy
     */
    Optional<OtpToken> findFirstByEmailAndTokenTypeOrderByCreatedAtDesc(String email, String tokenType);

    /**
     * Xóa các OTP tokens đã hết hạn
     * @param currentTime Thời gian hiện tại
     * @return Số lượng tokens đã xóa
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :currentTime")
    int deleteExpiredTokens(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Đánh dấu tất cả OTP tokens của một người dùng theo loại đã sử dụng
     * @param user Người dùng
     * @param tokenType Loại token
     * @return Số lượng tokens đã cập nhật
     */
    @Modifying
    @Transactional
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.user = :user AND o.tokenType = :tokenType AND o.used = false")
    int markAllUserTokensAsUsed(@Param("user") User user, @Param("tokenType") String tokenType);

    /**
     * Đánh dấu tất cả OTP tokens của một email theo loại đã sử dụng
     * @param email Email của người dùng
     * @param tokenType Loại token
     * @return Số lượng tokens đã cập nhật
     */
    @Modifying
    @Transactional
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email AND o.tokenType = :tokenType AND o.used = false")
    int markAllEmailTokensAsUsed(@Param("email") String email, @Param("tokenType") String tokenType);

    /**
     * Kiểm tra xem có OTP nào hợp lệ cho email và loại token không
     * @param email Email của người dùng
     * @param tokenType Loại token
     * @param currentTime Thời gian hiện tại
     * @return true nếu có OTP hợp lệ
     */
    @Query("SELECT COUNT(o) > 0 FROM OtpToken o WHERE o.email = :email AND o.tokenType = :tokenType AND o.used = false AND o.expiresAt > :currentTime")
    boolean hasValidOtpForEmailAndType(@Param("email") String email, 
                                       @Param("tokenType") String tokenType, 
                                       @Param("currentTime") LocalDateTime currentTime);
}
