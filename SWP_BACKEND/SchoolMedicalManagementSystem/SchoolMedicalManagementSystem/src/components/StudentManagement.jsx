import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch students
    const fetchStudents = async () => {
        try {
            const response = await api.get('/api/manager/students');
            setStudents(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching students:', error.response?.data || error.message);
            setError('Failed to fetch students');
        }
    };

    // Fetch parents
    const fetchParents = async () => {
        try {
            const response = await api.get('/api/manager/users?role=PARENT');
            setParents(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching parents:', error.response?.data || error.message);
            setError('Failed to fetch parents');
        }
    };

    // Create parent
    const createParent = async (parentData) => {
        try {
            // Format the parent data according to users table structure
            const parentWithRole = {
                firstName: parentData.firstName,
                lastName: parentData.lastName,
                dob: parentData.dob,
                gender: parentData.gender,
                phone: parentData.phone,
                address: parentData.address,
                jobTitle: parentData.jobTitle || 'Parent',
                roleName: 'PARENT'
                // Note: email, username, password are not needed for parent accounts
                // They will be set to null in the backend
            };

            const response = await api.post('/api/manager/users/create', parentWithRole);
            // Refresh parents list after creating new parent
            await fetchParents();
            return response.data;
        } catch (error) {
            console.error('Error creating parent:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create parent');
        }
    };

    // Create student with parents
    const createStudent = async (studentData) => {
        try {
            // First create parents if provided
            let motherRoleId = null;
            let fatherRoleId = null;

            if (studentData.mother) {
                const motherResponse = await createParent(studentData.mother);
                // Get the roleid from the created parent
                motherRoleId = motherResponse.roleId;
            }

            if (studentData.father) {
                const fatherResponse = await createParent(studentData.father);
                // Get the roleid from the created parent
                fatherRoleId = fatherResponse.roleId;
            }

            // Then create student with parent role IDs
            const studentWithParents = {
                ...studentData,
                motherId: motherRoleId,  // This will be stored as roleid in the student table
                fatherId: fatherRoleId   // This will be stored as roleid in the student table
            };

            const response = await api.post('/api/manager/students', studentWithParents);
            // Refresh students list after creating new student
            await fetchStudents();
            return response.data;
        } catch (error) {
            console.error('Error creating student:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create student');
        }
    };

    // Update student
    const updateStudent = async (studentId, studentData) => {
        try {
            const response = await api.put(`/api/manager/students/${studentId}`, studentData);
            // Refresh students list after updating
            await fetchStudents();
            return response.data;
        } catch (error) {
            console.error('Error updating student:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to update student');
        }
    };

    // Delete student
    const deleteStudent = async (studentId) => {
        try {
            await api.delete(`/api/manager/students/${studentId}`);
            // Refresh students list after deleting
            await fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to delete student');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchStudents(), fetchParents()]);
            } catch (error) {
                console.error('Error loading data:', error.response?.data || error.message);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {/* Your component JSX here */}
        </div>
    );
};

export default StudentManagement; 