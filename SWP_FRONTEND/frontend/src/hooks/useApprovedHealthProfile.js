import { useState, useEffect } from 'react';
import { message } from 'antd';
import { parentApi } from '../api/parentApi';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

export const useApprovedHealthProfile = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [approvedProfiles, setApprovedProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewDetailData, setViewDetailData] = useState(null);
  const [viewDetailType, setViewDetailType] = useState(null);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudentsData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await parentApi.getMyStudents(token);
        
        if (response && Array.isArray(response)) {
          setStudents(response);
        } else {
          console.warn('Unexpected response format for students:', response);
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        message.error('Không thể tải danh sách học sinh');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, [getToken]);

  // Load approved profiles when student is selected
  useEffect(() => {
    const loadApprovedProfiles = async () => {
      if (!selectedStudent) return;
      
      try {
        setProfilesLoading(true);
        const studentId = selectedStudent.id || selectedStudent.studentID;
        
        // Use the new API to get approved profiles
        const profiles = await parentApi.getApprovedHealthProfiles(studentId, getToken());
        setApprovedProfiles(profiles || []);
        
        // Auto-select the latest profile
        if (profiles && profiles.length > 0) {
          const latestProfile = profiles.sort((a, b) => 
            dayjs(b.updatedAt).unix() - dayjs(a.updatedAt).unix()
          )[0];
          setSelectedProfile(latestProfile);
        }
      } catch (error) {
        console.error('Error loading approved profiles:', error);
        message.error('Không thể tải hồ sơ sức khỏe đã duyệt');
        setApprovedProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };

    loadApprovedProfiles();
  }, [selectedStudent, getToken]);

  // Handler functions
  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === studentId || s.studentID === studentId);
    if (student) {
      setSelectedStudent(student);
    }
  };

  const handleProfileSelect = (profileId) => {
    const profile = approvedProfiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
  };

  const handleViewDetail = (item, type) => {
    setViewDetailData(item);
    setViewDetailType(type);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setViewDetailData(null);
    setViewDetailType(null);
  };

  // Helper function for BMI category
  const getBMICategory = (weight, height) => {
    const bmi = weight / Math.pow(height / 100, 2);
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 25) return 'Bình thường';
    if (bmi < 30) return 'Thừa cân';
    return 'Béo phì';
  };
  // Helper function to get student name
  const getStudentName = (student) => {
    if (!student) return 'Học sinh';
    return student.firstName && student.lastName 
      ? `${student.lastName} ${student.firstName}` 
      : student.name || 'Tên không có';
  };

  // Helper function to get student ID
  const getStudentId = (student) => {
    if (!student) return null;
    return student.id || student.studentID;
  };

  return {
    // State
    loading,
    students,
    selectedStudent,
    approvedProfiles,
    selectedProfile,
    profilesLoading,
    detailModalVisible,
    viewDetailData,
    viewDetailType,
    
    // Handlers
    handleStudentSelect,
    handleProfileSelect,
    handleViewDetail,
    handleCloseDetailModal,
    
    // Helpers
    getBMICategory,
    getStudentName,
    getStudentId
  };
};
