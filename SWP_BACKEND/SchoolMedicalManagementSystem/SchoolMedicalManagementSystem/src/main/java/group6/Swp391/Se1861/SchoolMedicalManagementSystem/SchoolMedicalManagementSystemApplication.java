package group6.Swp391.Se1861.SchoolMedicalManagementSystem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@SpringBootApplication
public class SchoolMedicalManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SchoolMedicalManagementSystemApplication.class, args);
	}

	@Component
	public class DatabaseInitializer implements CommandLineRunner {

		@Autowired
		private JdbcTemplate jdbcTemplate;

		@Override
		public void run(String... args) throws Exception {
			// Kiểm tra xem admin đã tồn tại chưa
			try {
				Integer count = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM users WHERE username = 'admin'", Integer.class);

				if (count == null || count == 0) {
					// Thêm admin mới với mật khẩu đã mã hóa (bcrypt) - mật khẩu: admin123
					jdbcTemplate.update(
						"INSERT INTO users (username, password, first_name, last_name, dob, gender, phone, email, address, job_title, created_date, last_modified_date, enabled, roleid) " +
						"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)",
						"admin",
						"$2a$10$yfIHMg.DKtWCdQh2U5dEBuhwGlmyahVIs9GGbLZ5QZcI01h5HnHhe", // mật khẩu đã mã hóa: admin123
						"System",
						"Administrator",
						"1990-01-01", // ngày sinh mặc định
						"M", // giới tính mặc định
						"+84123456789", // số điện thoại mặc định
						"admin@school.edu",
						"School Address", // địa chỉ mặc định
						"System Administrator",
						true, // enabled
						1 // roleid = 1 cho admin
					);
					System.out.println("Admin user created successfully");
				} else {
					System.out.println("Admin user already exists");
				}
			} catch (Exception e) {
				System.err.println("Failed to initialize admin user: " + e.getMessage());
				e.printStackTrace();
			}
		}
	}
}
