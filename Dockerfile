# Stage 1: Build using Maven Wrapper
FROM eclipse-temurin:21-jdk AS build

# Set work directory
WORKDIR /app

# Copy entire backend project
COPY SWP_BACKEND /app

# Give permission to mvnw
RUN chmod +x mvnw

# Build the project (skip tests for faster build)
WORKDIR /app/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the Spring Boot app
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem/target/SchoolMedicalManagementSystem-0.0.1-SNAPSHOT.jar app.jar

# Expose port (Spring Boot default)
EXPOSE 8080

# Set environment profile (optional)
ENV SPRING_PROFILES_ACTIVE=prod

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
