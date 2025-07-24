# ===== Stage 1: Build using Maven Wrapper =====
FROM eclipse-temurin:21-jdk AS build

# Set working directory
WORKDIR /app

# Copy entire backend code into container
COPY SWP_BACKEND /app

# Move into the directory where mvnw exists
WORKDIR /app/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem

# Make mvnw executable
RUN chmod +x mvnw

# Build the project (skip tests to save time)
RUN ./mvnw clean package -DskipTests

# ===== Stage 2: Run the Spring Boot JAR =====
FROM eclipse-temurin:21-jdk-jammy

# Create working directory
WORKDIR /app

# Copy the built JAR file from previous stage
COPY --from=build /app/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem/target/SchoolMedicalManagementSystem-0.0.1-SNAPSHOT.jar app.jar

# Expose the Spring Boot port
EXPOSE 8080

# Set active Spring profile
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
