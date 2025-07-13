# PowerShell Build script for Render deployment

Write-Host "Starting build process..."

# Navigate to the backend directory
Set-Location "SWP_BACKEND/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem"

# Clean and build the project
Write-Host "Cleaning and building the project..."

# For Windows, use mvnw.cmd
if ($IsWindows -or $env:OS -eq "Windows_NT") {
    .\mvnw.cmd clean package -DskipTests
} else {
    chmod +x mvnw
    ./mvnw clean package -DskipTests
}

Write-Host "Build completed successfully!"
