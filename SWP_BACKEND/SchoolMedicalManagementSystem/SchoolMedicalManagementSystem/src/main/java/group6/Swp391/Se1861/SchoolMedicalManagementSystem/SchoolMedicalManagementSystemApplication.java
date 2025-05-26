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
			 // Database initialization logic goes here if needed in the future
		}
	}
}
