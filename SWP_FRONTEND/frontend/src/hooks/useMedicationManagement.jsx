import { useState, useEffect } from 'react';
import { message, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { medicationService } from '../services/medicationService';
import { medicationValidation, medicationDateUtils } from '../utils/medicationValidation';

/**
 * Custom hook for medication management
 * Focuses on state management and composition of services
 */
export const useMedicationManagement = () => {
  const { getToken } = useAuth();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [medicationRequests, setMedicationRequests] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [tabKey, setTabKey] = useState('active');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMedicationDetail, setSelectedMedicationDetail] = useState(null);

  // Fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Fetch students and medication requests in parallel
      const [studentsData, medicationData] = await Promise.all([
        medicationService.fetchStudents(token),
        medicationService.fetchMedicationRequests(token)
      ]);
      
      // Map medication data to include student names
      const formattedMedications = medicationData.map(med => {
        // If the student name doesn't exist but we have the student ID, try to get it from the students array
        if (!med.studentName && med.studentId) {
          const student = studentsData.find(s => s.id === med.studentId);
          if (student) {
            med.studentName = `${student.lastName} ${student.firstName}`;
          }
        }
        
        return med;
      });
      
      setStudents(studentsData);
      setMedicationRequests(formattedMedications);
      
      // Select the first student by default if available
      if (studentsData.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Error handling is done in the service
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show modal for adding a new medication request
  const showAddModal = (form) => {
    setIsEdit(false);
    setCurrentMedication(null);
    setIsConfirmed(false);
    form.resetFields();
    
    // Set default values
    const defaultDateRange = medicationDateUtils.getDefaultDateRange();
    const defaultTimeSlots = medicationDateUtils.getDefaultTimeSlots(1);
    
    const defaultValues = {
      itemRequests: [{ 
        itemType: 'TABLET',
        unit: 'viên',
        frequency: 1,
        startDate: defaultDateRange.startDate,
        endDate: defaultDateRange.endDate,
        timeSlots: defaultTimeSlots
      }]
    };
    
    // Add student ID if available
    if (students && students.length > 0) {
      let validStudentId = null;
      
      // First try to use the selected ID if it exists in the students array
      if (selectedStudentId) {
        const studentExists = students.some(s => s.id === selectedStudentId);
        if (studentExists) {
          validStudentId = selectedStudentId;
        }
      }
      
      // If no valid selected ID, use the first student
      if (!validStudentId && students[0] && students[0].id) {
        validStudentId = students[0].id;
      }
      
      if (validStudentId) {
        defaultValues.studentId = validStudentId;
        setSelectedStudentId(validStudentId);
        console.log('Setting default student ID:', validStudentId);
      } else {
        console.warn('No valid student ID found to set as default');
      }
    }
    
    form.setFieldsValue(defaultValues);
    setVisible(true);
  };

  // Show modal for editing an existing medication request
  const showEditModal = async (record, form) => {
    try {
      setIsEdit(true);
      setCurrentMedication(record);
      setIsConfirmed(record.isConfirmed);
      
      // Fetch detailed medication request data
      const token = getToken();
      const detailedData = await medicationService.fetchMedicationRequestDetails(token, record.id);
      
      // Use detailed data if available, fallback to record data
      const medicationData = detailedData || record;
      
      // Format data for form
      const formData = medicationService.formatMedicationDataForForm(medicationData);
      
      form.setFieldsValue(formData);
      setVisible(true);
    } catch {
      // Error handling is done in the service
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    console.log('Form values submitted:', values);
    
    // Comprehensive validation
    const validation = medicationValidation.validateFormSubmission(values, isConfirmed);
    if (!validation.isValid) {
      validation.errors.forEach(error => message.error(error));
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      if (isEdit) {
        // Validate that only PENDING requests can be updated
        const statusValidation = medicationValidation.validateStatusForOperation(currentMedication.status, 'edit');
        if (!statusValidation.isValid) {
          message.error(statusValidation.message);
          setLoading(false);
          return;
        }
        
        // Update existing request
        const updatedRequest = await medicationService.updateMedicationRequest(token, currentMedication.id, values);
        
        // Update the local state with the updated request
        setMedicationRequests(prev => 
          prev.map(req => 
            req.id === currentMedication.id 
              ? {
                  ...updatedRequest,
                  studentName: updatedRequest.studentName || (() => {
                    const student = students.find(s => s.id === updatedRequest.studentId);
                    return student ? `${student.firstName} ${student.lastName}` : currentMedication.studentName;
                  })()
                }
              : req
          )
        );
      } else {
        // Create new request
        const newRequest = await medicationService.createMedicationRequest(token, values);
        
        // If the API returned the new request with all data, add it to our state directly
        if (newRequest && newRequest.id) {
          setMedicationRequests(prev => {
            // Create a properly formatted medication request with the returned data
            const formattedRequest = {
              ...newRequest,
              // Ensure studentName is set
              studentName: newRequest.studentName || (() => {
                const student = students.find(s => s.id === newRequest.studentId);
                return student ? `${student.lastName} ${student.firstName}` : 'N/A';
              })()
            };
            
            return [formattedRequest, ...prev];
          });
        } else {
          // If not, fetch all data again
          fetchData();
        }
      }
      
      // Close the modal
      setVisible(false);
    } catch {
      // Error handling is done in the service
    } finally {
      setLoading(false);
    }
  };

  // Handle delete medication request
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Find the medication request to validate status
      const medicationToDelete = medicationRequests.find(req => req.id === id);
      if (!medicationToDelete) {
        message.error('Không tìm thấy yêu cầu thuốc');
        setLoading(false);
        return;
      }
      
      // Validate that only PENDING requests can be deleted
      const statusValidation = medicationValidation.validateStatusForOperation(medicationToDelete.status, 'delete');
      if (!statusValidation.isValid) {
        message.error(statusValidation.message);
        setLoading(false);
        return;
      }
      
      console.log('Deleting medication request with ID:', id);
      
      // Optimistic update - remove from UI immediately
      const previousRequests = medicationRequests;
      setMedicationRequests(prev => prev.filter(req => req.id !== id));
      
      try {
        await medicationService.deleteMedicationRequest(token, id);
      } catch (apiError) {
        // Rollback optimistic update on error
        setMedicationRequests(previousRequests);
        throw apiError;
      }
      
    } catch {
      console.error('Error deleting medication request');
      // Error handling is done in the service
    } finally {
      setLoading(false);
    }
  };

  // Handle view detail
  const handleViewDetail = async (record) => {
    console.log('View details button clicked for record:', record);
    
    try {
      const token = getToken();
      console.log('Fetching details for medication request ID:', record.id);
      
      const detailedData = await medicationService.fetchMedicationRequestDetails(token, record.id);
      
      // Use the detailed data from backend, fallback to record data if needed
      const medicationData = detailedData || record;
      
      // Set the data and show the modal
      setSelectedMedicationDetail(medicationData);
      setDetailModalVisible(true);
    } catch {
      // Error handling is done in the service
    }
  };

  // Get status tag for medication request
  const getStatusTag = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="success"> Đã duyệt</Tag>;
      case 'REJECTED':
        return <Tag icon={<CloseCircleOutlined />} color="error"> Đã từ chối</Tag>;
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="processing"> Đang chờ duyệt</Tag>;
      case 'COMPLETED':
        return <Tag icon={<CheckCircleOutlined />} color="blue"> Đã hoàn thành</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // Filter medications based on status
  const getFilteredMedications = () => {
    console.log('All medication requests before filtering:', medicationRequests);
    
    if (!Array.isArray(medicationRequests)) {
      console.error('medicationRequests is not an array:', medicationRequests);
      return [];
    }
    
    // First filter out any null/undefined medications or those without valid IDs
    const validMeds = medicationRequests.filter(med => med && med.id);
    
    let filteredData = [];
    if (tabKey === 'active') {
      filteredData = validMeds.filter(med => 
        med.status === 'PENDING'
      );
    } else {
      filteredData = validMeds.filter(med => 
        med.status === 'COMPLETED' || med.status === 'REJECTED'  || med.status === 'APPROVED'
      );
    }
    
    console.log('Filtered medication data:', filteredData);
    return filteredData;
  };

  return {
    // State
    loading,
    students,
    medicationRequests,
    visible,
    isEdit,
    currentMedication,
    tabKey,
    selectedStudentId,
    isConfirmed,
    detailModalVisible,
    selectedMedicationDetail,
    
    // Actions
    setVisible,
    setTabKey,
    setSelectedStudentId,
    setIsConfirmed,
    setDetailModalVisible,
    setSelectedMedicationDetail,
    
    // Handlers
    showAddModal,
    showEditModal,
    handleSubmit,
    handleDelete,
    handleViewDetail,
    
    // Helpers
    getStatusTag,
    getFilteredMedications,
    validateStartDate: medicationValidation.validateStartDate,
    validateEndDate: medicationValidation.validateEndDate,
    validateTimeSlot: medicationValidation.validateTimeSlot,
    disabledDate: medicationDateUtils.disabledDate,
    fetchData
  };
};
