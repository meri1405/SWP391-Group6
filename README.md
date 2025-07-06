# School Health Management System – Frontend

A full-stack web application designed to support schools in managing student health information. This is the frontend part of the project, developed using React and Vite. It communicates with a Spring Boot backend and is deployed on Firebase Hosting.

Live Demo: https://schoolmedical-system.web.app

## Features

- Manage health check-up and vaccination campaigns
- Handle student medication instructions and schedules
- Record medical history and notes
- Role-based access for Admin, Manager, School Nurse, and Parent
- Email-based password reset and OTP confirmation on first login
- Dashboard views for reports and task tracking

## Tech Stack

### Backend

- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- Java 21
- MySQL
- Email service for OTP and password reset

### Frontend

- React 18
- Vite
- Axios for API communication
- Ant Design for UI components
- Firebase Hosting

## Setup Instructions

### Prerequisites

- Java 21 or higher
- Node.js (v18 or higher recommended)
- MySQL Server
- Firebase CLI (if you want to deploy): npm install -g firebase-tools

## Backend Setup

If you are also running the backend locally, follow these steps:

1. Navigate to the backend folder: cd SWP391-Group6/SWP_BACKEND/SchoolMedicalManagementSystem

2. Open `application.properties` and configure your database settings.

3. Start the Spring Boot application: ./mvnw spring-boot:run

or on Windows: mvnw.cmd spring-boot:run


4. The backend API will be available at:  
`http://localhost:8080`

## Frontend Setup

1. Navigate to the frontend folder: cd SWP391-Group6/SWP_FRONTEND/frontend

2. Install the dependencies: npm install

3. Start the development server: npm run dev

4. The frontend will run on:  
`http://localhost:5173`

## Build and Deploy with Firebase

1. Build the production version: npm run build

2. Deploy to Firebase: firebase deploy


3. After successful deployment, the application will be available at:  https://schoolmedical-system.web.app

## User Roles and Permissions

| Role         | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| Admin        | Manage users, assign roles, oversee the entire system                      |
| Manager      | Confirm vaccination/health check schedules, view school-wide health data   |
| School Nurse | Create and manage health schedules, track medical records and medicine use |
| Parent       | Submit child health and medication info, confirm participation             |

## Email-based Authentication Flow

- Admin assigns a one-time password when creating a new user account
- On the first login:
  - User must change their password
  - OTP is sent to their registered email for verification

## License

This project is developed for academic and internal school usage only. Redistribution or commercial use is not permitted without permission.

For questions or contributions, please contact the development team.










