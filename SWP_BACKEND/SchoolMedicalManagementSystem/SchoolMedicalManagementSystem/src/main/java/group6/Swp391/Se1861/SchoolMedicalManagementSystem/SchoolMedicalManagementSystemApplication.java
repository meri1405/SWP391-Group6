package group6.Swp391.Se1861.SchoolMedicalManagementSystem;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.utils.PhoneValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

/**
 * Lớp chính của ứng dụng Quản lý Y tế Trường học
 * - Khởi tạo ứng dụng Spring Boot
 * - Kích hoạt tính năng lập lịch tự động
 * - Khởi tạo dữ liệu ban đầu cho hệ thống
 */
@SpringBootApplication
@EnableScheduling
public class SchoolMedicalManagementSystemApplication {

	/**
	 * Hàm main - điểm khởi đầu của ứng dụng
	 * Khởi chạy ứng dụng Spring Boot
	 */
	public static void main(String[] args) {
		SpringApplication.run(SchoolMedicalManagementSystemApplication.class, args);
	}

	/**
	 * Lớp khởi tạo cơ sở dữ liệu
	 * Chạy tự động khi ứng dụng khởi động để thiết lập dữ liệu ban đầu
	 */
	@Component
	public class DatabaseInitializer implements CommandLineRunner {

		@Autowired
		private JdbcTemplate jdbcTemplate;
 
		/**
		 * Hàm chạy khi ứng dụng khởi động
		 * Khởi tạo các vai trò và tài khoản admin mặc định
		 */
		@Override
		public void run(String... args) throws Exception {
			// Đầu tiên, đảm bảo các vai trò tồn tại
			initializeRoles();

			// Sau đó, khởi tạo tài khoản admin
			initializeAdminUser();
		}

		/**
		 * Khởi tạo các vai trò trong hệ thống
		 * Tạo các vai trò: ADMIN, MANAGER, SCHOOLNURSE, PARENT
		 */
		private void initializeRoles() {
			try {
				// Kiểm tra xem các vai trò đã tồn tại chưa
				Integer roleCount = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM role", Integer.class);

				if (roleCount == null || roleCount == 0) {
					// Tạo các vai trò nếu chưa tồn tại
					jdbcTemplate.update(
						"INSERT INTO role (role_name) VALUES (?)",
						"ADMIN"
					);

					jdbcTemplate.update(
						"INSERT INTO role (role_name) VALUES (?)",
						"MANAGER"
					);

					jdbcTemplate.update(
						"INSERT INTO role (role_name) VALUES (?)",
						"SCHOOLNURSE"
					);					jdbcTemplate.update(
						"INSERT INTO role (role_name) VALUES (?)",
						"PARENT"
					);

					System.out.println("Tạo các vai trò thành công");
				}
			} catch (Exception e) {
				System.err.println("Lỗi khi khởi tạo vai trò: " + e.getMessage());
				e.printStackTrace();
			}
		}

		/**
		 * Khởi tạo tài khoản admin mặc định
		 * Tạo tài khoản admin với username: admin, password: admin123
		 */
		private void initializeAdminUser() {
			// Kiểm tra xem admin đã tồn tại chưa
			try {
				Integer count = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM users WHERE username = 'admin'", Integer.class);

				if (count == null || count == 0) {
					// Thêm admin mới với mật khẩu đã mã hóa (bcrypt) - mật khẩu: admin123
					String phone = "0962356789"; // Đầu số Viettel
					String errorMsg = PhoneValidator.validatePhone(phone);
					if (errorMsg != null) {
						System.err.println("Lỗi số điện thoại admin: " + errorMsg);
						phone = "0981234567"; // Thử với đầu số Viettel khác
					}
					
					jdbcTemplate.update(
						"INSERT INTO users (username, password, first_name, last_name, dob, gender, phone, email, address, job_title, created_date, last_modified_date, enabled, roleid) " +
						"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)",
						"admin",
						"$2a$10$7AioByOIfY4xxdtvy2x4u.qoB4IIV0zYuXBVEoZYeOAYVV67Yqkuy", // Mã hash BCrypt cho admin123
						"System",
						"Administrator",
						"1990-01-01", // Ngày sinh mặc định
							"M",
							phone,
							"admin@school.edu",
							"123 Main St, City, Country",
							"System Admin",
							true, // Đã kích hoạt
							1 // Giả sử roleid của ADMIN là 1
					);
					System.out.println("Tạo tài khoản admin thành công");
				} else {
					System.out.println("Tài khoản admin đã tồn tại");
				}
			} catch (Exception e) {
				System.err.println("Lỗi khi khởi tạo tài khoản admin: " + e.getMessage());
				e.printStackTrace();
			}
		}
	}
}


