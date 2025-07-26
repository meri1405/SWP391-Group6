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
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);

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
    // Double-check that student doesn't have existing results
    const studentId = student.studentID || student.id;
    if (hasExistingResults(studentId)) {
      message.warning("Học sinh này đã có kết quả khám sức khỏe.");
      return;
    }
    
    setSelectedStudent(student);
    
    // Initialize form data for this student
    const initialData = initializeFormData(campaign);
    
    // Check if student has existing results and load them (shouldn't happen after above check)
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

    // Check if student already has results to prevent duplicates
    const studentId = selectedStudent.studentID || selectedStudent.id;
    if (hasExistingResults(studentId)) {
      message.error("Học sinh này đã có kết quả khám sức khỏe. Không thể tạo kết quả mới.");
      return;
    }

    // Prevent double submission with time-based debounce
    const now = Date.now();
    if (isSubmitting) {
      message.warning("Đang xử lý... Vui lòng đợi.");
      return;
    }

    // Prevent rapid successive submissions (less than 5 seconds apart)
    if (lastSubmissionTime && (now - lastSubmissionTime) < 5000) {
      message.warning("Vui lòng đợi một chút trước khi gửi lại.");
      return;
    }

    // Validate form data
    const validation = validateFormData(formData, modalMode);
    if (!validation.isValid) {
      validation.errors.forEach(error => message.error(error));
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(now);
    setSubmissionAttempts(prev => prev + 1);

    try {
      // Transform form data to backend format
      const resultData = healthCheckResultsService.transformFormDataToDTO(
        formData, 
        selectedStudent, 
        campaign
      );

      // Show category selection info to user if multiple categories were filled
      if (resultData.categorySelectionInfo) {
        const { totalCategories, allCategories } = resultData.categorySelectionInfo;
        
        if (totalCategories > 1) {
          const categoryNames = {
            'HEARING': 'Thính giác',
            'VISION': 'Thị giác', 
            'ORAL': 'Răng miệng',
            'SKIN': 'Da liễu',
            'RESPIRATORY': 'Hô hấp'
          };
          
          const categoryList = allCategories.map(cat => categoryNames[cat] || cat).join(', ');
            
          message.info({
            content: `Hệ thống sẽ lưu tất cả ${totalCategories} hạng mục: ${categoryList}`,
            duration: 6,
          });
        }
      }

      console.log('Submitting health check data:', resultData);

      // Submit to backend
      const success = await healthCheckResultsService.recordHealthCheckResult(resultData);
      
      if (success) {
        // Reset submission tracking
        setSubmissionAttempts(0);
        setLastSubmissionTime(null);
        
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
      } else {
        // If submission failed, allow retry after a longer delay
        setLastSubmissionTime(now - 3000); // Reduce the wait time for retry
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      message.error("Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại sau.");
      
      // Reset timing to allow retry
      setLastSubmissionTime(now - 3000);
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
