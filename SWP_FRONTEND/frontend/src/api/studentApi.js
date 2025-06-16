import { API_BASE_URL } from '../config';
import { getAuthHeaders } from '../utils/auth';

// Get all students
export const getAllStudents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

// Add new student
export const addStudent = async (studentData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding student:', error);
        throw error;
    }
};

// Get student by ID
export const getStudentById = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching student:', error);
        throw error;
    }
};

// Update student
export const updateStudent = async (studentId, studentData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
};

// Delete student
export const deleteStudent = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
    }
}; 