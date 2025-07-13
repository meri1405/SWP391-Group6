#!/bin/bash

# Build script for Render deployment

echo "Starting build process..."

# Navigate to the backend directory
cd SWP_BACKEND/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem

# Make mvnw executable
chmod +x mvnw

# Clean and build the project
echo "Cleaning and building the project..."
./mvnw clean package -DskipTests

echo "Build completed successfully!"
