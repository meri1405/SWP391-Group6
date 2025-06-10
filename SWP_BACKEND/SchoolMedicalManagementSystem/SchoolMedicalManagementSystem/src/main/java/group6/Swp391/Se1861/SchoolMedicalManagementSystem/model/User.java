package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Entity đại diện cho người dùng trong hệ thống
 * Hỗ trợ nhiều vai trò: ADMIN, MANAGER, SCHOOLNURSE, PARENT, STUDENT
 * 
 * Đặc điểm:
 * - Phụ huynh (PARENT) và học sinh (STUDENT): không có username, password, email
 * - Các vai trò khác: yêu cầu đầy đủ thông tin đăng nhập
 * - Hỗ trợ xác thực OAuth2 (Google) và OTP (cho phụ huynh)
 * - Tự động audit thời gian tạo và cập nhật
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails, OAuth2User {
    
    /** ID duy nhất của người dùng - khóa chính */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID", unique = true, nullable = false)
    private Long id;

    /** Tên đăng nhập - chỉ dành cho ADMIN, MANAGER, SCHOOLNURSE */
    @Column(name = "username")
    private String username;

    /** Mật khẩu đã mã hóa - chỉ dành cho ADMIN, MANAGER, SCHOOLNURSE */
    @Column(name = "password")
    private String password;

    /** Tên của người dùng - bắt buộc cho tất cả vai trò */
    @Column(name = "firstName", nullable = false)
    private String firstName;

    /** Họ của người dùng - bắt buộc cho tất cả vai trò */
    @Column(name = "lastName", nullable = false)
    private String lastName;

    /** Ngày sinh - bắt buộc cho tất cả vai trò */
    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    /** Giới tính (M/F) - bắt buộc cho tất cả vai trò */
    @Column(name = "gender", nullable = false, length = 1)
    private String gender;

    /** Số điện thoại - duy nhất, bắt buộc cho PARENT, tùy chọn cho STUDENT */
    @Column(name = "phone", nullable = true, unique = true)
    private String phone;

    /** Email - chỉ dành cho ADMIN, MANAGER, SCHOOLNURSE */
    @Column(name = "email")
    private String email;

    /** Địa chỉ - bắt buộc cho tất cả vai trò */
    @Column(name = "address", nullable = false)
    private String address;

    /** Chức vụ công việc - bắt buộc cho tất cả vai trò trừ STUDENT */
    @Column(name = "jobTitle", nullable = false)
    private String jobTitle;

    /** Thời gian tạo tài khoản - tự động cập nhật */
    @CreatedDate
    @Column(name = "createdDate", nullable = false)
    private LocalDateTime createdDate;

    /** Thời gian cập nhật cuối - tự động cập nhật */
    @LastModifiedDate
    @Column(name = "lastModifiedDate", nullable = false)
    private LocalDateTime lastModifiedDate;

    /** Trạng thái kích hoạt tài khoản */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    /** Vai trò của người dùng - liên kết với bảng Role */
    @ManyToOne
    @JoinColumn(name = "roleID") // FK tới Role.id
    private Role role;

    /** Danh sách con cái với vai trò là mẹ - chỉ dành cho PARENT */
    @OneToMany(mappedBy = "mother", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<Student> childrenAsMother;

    /** Danh sách con cái với vai trò là cha - chỉ dành cho PARENT */
    @OneToMany(mappedBy = "father", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<Student> childrenAsFather;

    /** Danh sách chiến dịch tiêm chủng đã tạo - dành cho ADMIN/MANAGER */
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<VaccinationCampaign> createdCampaigns;

    /** Danh sách chiến dịch tiêm chủng được quản lý - dành cho MANAGER */
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<VaccinationCampaign> managedCampaigns;

    /** Danh sách yêu cầu thuốc do y tá xử lý - dành cho SCHOOLNURSE */
    @OneToMany(mappedBy = "nurse", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<MedicationRequest> nurseMedicationRequests;    

    /** Danh sách yêu cầu thuốc do phụ huynh tạo - dành cho PARENT */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<MedicationRequest> parentMedicationRequests;

    /** Danh sách hồ sơ sức khỏe do y tá quản lý - dành cho SCHOOLNURSE */
    @OneToMany(mappedBy = "nurse", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<HealthProfile> healthProfilesNurse;

    /** Danh sách hồ sơ sức khỏe do phụ huynh quản lý - dành cho PARENT */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonIgnore  // Ngăn vòng lặp khi serialize JSON
    private List<HealthProfile> healthProfilesParent;

    /** Thuộc tính OAuth2 - không lưu vào database */
    @Transient
    @JsonIgnore  // Ngăn serialize thuộc tính OAuth2
    private Map<String, Object> attributes;

    /**
     * Lấy quyền hạn của người dùng dựa trên vai trò
     * @return Collection các quyền hạn
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.getRoleName().toUpperCase()));
    }

    /**
     * Kiểm tra tài khoản có được kích hoạt không
     * @return true nếu tài khoản được kích hoạt
     */
    @Override
    public boolean isEnabled() {
        return enabled != null ? enabled : true;
    }

    /**
     * Lấy thuộc tính OAuth2
     * @return Map các thuộc tính OAuth2
     */
    @Override
    public Map<String, Object> getAttributes() {
        return attributes == null ? new HashMap<>() : attributes;
    }

    /**
     * Thiết lập thuộc tính OAuth2
     * @param attributes Map các thuộc tính OAuth2
     */
    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    /**
     * Lấy tên định danh cho OAuth2
     * @return ID người dùng dưới dạng chuỗi
     */
    @Override
    public String getName() {
        return String.valueOf(this.id);
    }

    /**
     * Lấy mật khẩu cho xác thực
     * @return Mật khẩu đã mã hóa
     */
    @Override
    public String getPassword() {
        // Đảm bảo mật khẩu luôn được trả về để xác thực
        return this.password;
    }

    /**
     * Lấy tên đăng nhập cho xác thực
     * @return Tên đăng nhập
     */
    @Override
    public String getUsername() {
        // Trả về username như bình thường, không kiểm tra vai trò
        // Đảm bảo Spring Security có thể xác thực bằng username
        return this.username;
    }

    /**
     * Lấy tên đăng nhập để hiển thị (có điều kiện theo vai trò)
     * @return Username hoặc null nếu là PARENT
     */
    public String getUsernameForDisplay() {
        // Nếu cần logic username có điều kiện để hiển thị,
        // sử dụng method này thay vì override getUsername()
        if ("PARENT".equalsIgnoreCase(this.role.getRoleName())) {
            return null;
        }
        return this.username;
    }

    /**
     * Lấy mật khẩu cho các vai trò không phải PARENT
     * @return Mật khẩu hoặc null nếu là PARENT
     */
    public String getPasswordForNonParent() {
        if ("PARENT".equalsIgnoreCase(this.role.getRoleName())) {
            return null;
        }
        return this.password;
    }

    /**
     * Lấy email cho các vai trò không phải PARENT
     * @return Email hoặc null nếu là PARENT
     */
    public String getEmailForNonParent() {
        if ("PARENT".equalsIgnoreCase(this.role.getRoleName())) {
            return null;
        }
        return this.email;
    }

    /**
     * Kiểm tra tài khoản có hết hạn không
     * @return true - tài khoản không hết hạn
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Kiểm tra tài khoản có bị khóa không
     * @return true - tài khoản không bị khóa
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Kiểm tra thông tin xác thực có hết hạn không
     * @return true - thông tin xác thực không hết hạn
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Lấy họ tên đầy đủ
     * @return Họ tên đầy đủ (Họ + Tên)
     */
    public String getFullName() {
        return lastName + " " + firstName;
    }

    /**
     * Lấy tên vai trò
     * @return Tên vai trò hoặc null nếu chưa có vai trò
     */
    public String getRoleName() {
        return this.role != null ? this.role.getRoleName() : null;
    }

    /**
     * Lấy thời gian tạo tài khoản (alias cho createdDate)
     * @return Thời gian tạo tài khoản
     */
    public LocalDateTime getCreatedAt() {
        return this.createdDate;
    }

    /**
     * Lấy ngày sinh (alias cho dob)
     * @return Ngày sinh
     */
    public LocalDate getDateOfBirth() {
        return this.dob;
    }
}
