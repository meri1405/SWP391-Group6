#!/bin/bash

# Start script for Render deployment

echo "Starting School Medical Management System..."

# Navigate to the backend directory
cd SWP_BACKEND/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem

# Run the Spring Boot application with production profile
java -jar target/SchoolMedicalManagementSystem-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
