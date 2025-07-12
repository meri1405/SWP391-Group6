import { useState, useEffect } from 'react';
import { message } from 'antd';
import healthCheckResultsService from '../services/healthCheckResultsService';
import { 
  initializeFormData, 
  mapExistingResultsToFormData, 
  validateFormData 
} from '../utils/healthCheckFormUtils';

/**
 * Custom hook for managing health check results form state and operations
 * @param {string} campaignId - The campaign ID
 * @param {Object} campaign - Campaign data
 * @param {Function} onRefreshData - Callback to refresh parent data
 * @returns {Object} Hook state and methods
 */
export const useHealthCheckResults = (campaignId, campaign, onRefreshData) => {
  // State management
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedStudents, setConfirmedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("record"); // 'record' or 'view'
  const [existingResults, setExistingResults] = useState({});

  // Fetch confirmed students and existing results when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) return;

      setLoadingStudents(true);
      try {
        // Fetch confirmed students
        const students = await healthCheckResultsService.getConfirmedStudents(campaignId);
        setConfirmedStudents(students);

        // Fetch existing health check results
        const results = await healthCheckResultsService.getCampaignResults(campaignId);
        setExistingResults(results);
      } catch (error) {
        console.error("Error fetching data:", error);
        setConfirmedStudents([]);
        setExistingResults({});
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchData();
  }, [campaignId]);

  // Handle opening record modal
  const handleRecordResult = (student) => {
    setSelectedStudent(student);
    setModalMode("record");
    setIsModalVisible(true);

    // Initialize form data
    const initialData = initializeFormData(campaign);
    setFormData(initialData);
  };

  // Handle opening view modal
  const handleViewResult = (student) => {
    setSelectedStudent(student);
    setModalMode("view");
    setIsModalVisible(true);

    // Load existing results for this student
    const studentResults = existingResults[student.studentID];
    
    if (studentResults) {
      // Populate form data with existing results
      const loadedData = mapExistingResultsToFormData(studentResults, campaign);
      setFormData(loadedData);
    } else {
      console.log("No existing results found for student:", student.studentID);
      // Initialize with empty data
      const initialData = initializeFormData(campaign);
      setFormData(initialData);
    }
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    setFormData({});
  };

  // Check if student has existing results
  const hasExistingResults = (studentId) => {
    return existingResults[studentId] || false;
  };

  // Handle input changes
  const handleInputChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  // Handle overall measurement changes
  const handleOverallMeasurementChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || "",
    }));
  };

  // Handle student selection for recording results
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    
    // Initialize form data for this student
    const initialData = initializeFormData(campaign);
    
    // Check if student has existing results and load them
    const studentResults = existingResults[student.studentID];
    if (studentResults) {
      const loadedData = mapExistingResultsToFormData(studentResults, campaign);
      setFormData(loadedData);
    } else {
      setFormData(initialData);
    }
  };

  // Handle modal OK button
  const handleModalOk = () => {
    handleSubmit();
  };

  // Handle modal cancel button
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    setFormData({});
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedStudent) {
      message.error("Vui lòng chọn học sinh");
      return;
    }

    // Validate form data
    const validation = validateFormData(formData, modalMode);
    if (!validation.isValid) {
      validation.errors.forEach(error => message.error(error));
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform form data to backend format
      const resultData = healthCheckResultsService.transformFormDataToDTO(
        formData, 
        selectedStudent, 
        campaign
      );

      // Submit to backend
      const success = await healthCheckResultsService.recordHealthCheckResult(resultData);
      
      if (success) {
        // Close modal and reset form
        setIsModalVisible(false);
        setSelectedStudent(null);
        setFormData({});

        // Refresh data to update table with new results
        if (onRefreshData) {
          onRefreshData();
        }

        // Also refresh local data to update existing results
        try {
          const updatedResults = await healthCheckResultsService.getCampaignResults(campaignId);
          setExistingResults(updatedResults);
        } catch (error) {
          console.error("Error refreshing results data:", error);
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    selectedStudent,
    formData,
    isSubmitting,
    confirmedStudents,
    loadingStudents,
    isModalVisible,
    modalMode,
    existingResults,
    
    // Actions
    handleRecordResult,
    handleViewResult,
    handleCloseModal,
    handleInputChange,
    handleOverallMeasurementChange,
    handleSubmit,
    hasExistingResults,
    handleStudentSelect,
    handleModalOk,
    handleModalCancel,
    
    // Utilities
    setFormData,
    setSelectedStudent,
    setIsModalVisible,
    setModalMode
  };
};
