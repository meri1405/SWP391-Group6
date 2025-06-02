package group6.Swp391.Se1861.SchoolMedicalManagementSystem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

@SpringBootApplication
@EnableScheduling
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
			// First, ensure roles exist
			initializeRoles();

			// Then, initialize admin user
			initializeAdminUser();
		}

		private void initializeRoles() {
			try {
				// Check if roles already exist
				Integer roleCount = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM role", Integer.class);

				if (roleCount == null || roleCount == 0) {
					// Create roles if they don't exist
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
					);

					jdbcTemplate.update(
						"INSERT INTO role (role_name) VALUES (?)",
						"PARENT"
					);

					System.out.println("Roles created successfully");
				} else {
					System.out.println("Roles already exist");
				}
			} catch (Exception e) {
				System.err.println("Failed to initialize roles: " + e.getMessage());
				e.printStackTrace();
			}
		}

		private void initializeAdminUser() {
			// Check if admin already exists
			try {
				Integer count = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM users WHERE username = 'admin'", Integer.class);

				if (count == null || count == 0) {
					// Add new admin with encrypted password (bcrypt) - password: admin123
					jdbcTemplate.update(
						"INSERT INTO users (username, password, first_name, last_name, dob, gender, phone, email, address, job_title, created_date, last_modified_date, enabled, roleid) " +
						"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)",
						"admin",
						"$2a$10$7AioByOIfY4xxdtvy2x4u.qoB4IIV0zYuXBVEoZYeOAYVV67Yqkuy", // BCrypt hash for admin123
						"System",
						"Administrator",
						"1990-01-01", // default DOB
							"M",
							"+84123456789",
							"admin@school.edu",
							"123 Main St, City, Country",
							"System Admin",
							true, // enabled
							1 // Assuming roleid for ADMIN is 1
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


