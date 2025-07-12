import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createHealthProfileService } from '../services/healthProfileService';
import { getStudentId } from '../utils/healthProfileUtils';

/**
 * Custom hook for managing approved health profile state and operations
 */
export const useApprovedHealthProfileRefactored = () => {
  const { getToken } = useAuth();
  const [healthProfileService] = useState(() => createHealthProfileService(getToken));
  
  // State management
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
        const studentsData = await healthProfileService.fetchStudents();
        setStudents(studentsData);
      } catch {
        // Error is already handled in the service
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, [healthProfileService]);

  // Load approved profiles when student is selected
  useEffect(() => {
    const loadApprovedProfiles = async () => {
      if (!selectedStudent) return;
      
      try {
        setProfilesLoading(true);
        const studentId = getStudentId(selectedStudent);
        
        const profiles = await healthProfileService.fetchApprovedHealthProfiles(studentId);
        setApprovedProfiles(profiles);
        
        // Auto-select the latest profile
        const latestProfile = healthProfileService.getLatestProfile(profiles);
        setSelectedProfile(latestProfile);
      } catch {
        // Error is already handled in the service
        setApprovedProfiles([]);
        setSelectedProfile(null);
      } finally {
        setProfilesLoading(false);
      }
    };

    loadApprovedProfiles();
  }, [selectedStudent, healthProfileService]);

  // Handler functions
  const handleStudentSelect = (studentId) => {
    const student = healthProfileService.findStudentById(students, studentId);
    setSelectedStudent(student);
  };

  const handleProfileSelect = (profileId) => {
    const profile = healthProfileService.findProfileById(approvedProfiles, profileId);
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
    handleCloseDetailModal
  };
};

export default useApprovedHealthProfileRefactored;
