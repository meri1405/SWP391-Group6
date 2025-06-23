import { useState, useEffect } from 'react';
import { message, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import { parentApi } from '../api/parentApi';

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

  // Fetch students and medication requests
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Fetch students and medication requests in parallel
      const [studentsData, medicationData] = await Promise.all([
        parentApi.getMyStudents(token),
        parentApi.getMedicationRequests(token)
      ]);
      
      console.log('Students data received:', studentsData);
      console.log('Medication data received:', medicationData);
      
      // Filter out any students with null or undefined IDs
      // Backend returns studentID, so we need to map it to id for frontend compatibility
      const validStudents = Array.isArray(studentsData) 
        ? studentsData.filter(student => student && student.studentID).map(student => ({
            ...student,
            id: student.studentID  // Map studentID to id for frontend compatibility
          }))
        : [];
        
      // Ensure medication data is an array
      const validMedications = Array.isArray(medicationData)
        ? medicationData.filter(med => med && med.id)
        : [];
      
      console.log('Valid students after filtering:', validStudents);
      console.log('Valid medications after filtering:', validMedications);
      
      // Map medication data to ensure it has the expected format and fix student ID mapping
      const formattedMedications = validMedications.map(med => {
        // Make sure itemRequests is always an array
        if (!med.itemRequests) {
          med.itemRequests = [];
        }
        
        // If the student name doesn't exist but we have the student ID, try to get it from the students array
        if (!med.studentName && med.studentId) {
          const student = validStudents.find(s => s.id === med.studentId);
          if (student) {
            med.studentName = `${student.firstName} ${student.lastName}`;
          }
        }
        
        return med;
      });
      
      setStudents(validStudents);
      setMedicationRequests(formattedMedications);
      
      // Select the first student by default if available
      if (validStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(validStudents[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
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
    const defaultValues = {
      itemRequests: [{ 
        itemType: 'TABLET',
        frequency: 1,
        startDate: dayjs(),
        endDate: dayjs().add(7, 'day'),
        timeSlots: [dayjs().hour(8).minute(0)]  // Default first medication time to 8:00 AM
      }] // Default first empty medication item
    };
    
    // Add student ID if available
    if (students && students.length > 0) {
      // Find a valid student to use
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
        // Also update the selected student ID state
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
      
      // Fetch detailed medication request data to get item IDs
      const token = getToken();
      console.log('Fetching detailed data for edit modal, ID:', record.id);
      
      const detailedData = await parentApi.getMedicationRequestDetails(token, record.id);
      console.log('Detailed data for edit modal:', detailedData);
      
      // Use detailed data if available, fallback to record data
      const medicationData = detailedData || record;
      
      // Format the data for the form with proper item IDs
      const formData = {
        studentId: medicationData.studentId,
        note: medicationData.note,
        itemRequests: (medicationData.itemRequests || []).map(item => {
          console.log('Processing item for form:', item);
          let timeSlots = [];

          // First try to get timeSlots directly from scheduleTimes array
          if (Array.isArray(item.scheduleTimes)) {
            timeSlots = item.scheduleTimes.map(timeStr => dayjs(timeStr, 'HH:mm'));
            console.log('Found time slots from scheduleTimes:', timeSlots);
          } 
          // If no direct scheduleTimes, try to parse from note
          else if (item.note) {
            const scheduleTimeMatch = item.note.match(/scheduleTimeJson:(.*?)($|\s)/);
            if (scheduleTimeMatch) {
              try {
                const scheduleTimeJson = JSON.parse(scheduleTimeMatch[1]);
                if (scheduleTimeJson.scheduleTimes) {
                  timeSlots = scheduleTimeJson.scheduleTimes.map(timeStr => dayjs(timeStr, 'HH:mm'));
                  console.log('Found time slots from note JSON:', timeSlots);
                }
              } catch (e) {
                console.log('Error parsing schedule times from note:', e);
              }
            }
          }

          // Only create default slots if no existing slots were found
          if (timeSlots.length === 0 && item.frequency) {
            for (let i = 0; i < item.frequency; i++) {
              const defaultHour = i === 0 ? 8 : i === 1 ? 12 : i === 2 ? 18 : 8 + (i * 4) % 24;
              timeSlots.push(dayjs().hour(defaultHour).minute(0));
            }
          }

          // Clean the note to remove any schedule time JSON
          const cleanedNote = item.note ? item.note.replace(/scheduleTimeJson:.*?($|\s)/, '').trim() : '';
          
          return {
            ...item,
            startDate: item.startDate ? dayjs(item.startDate) : dayjs(),
            endDate: item.endDate ? dayjs(item.endDate) : dayjs().add(7, 'day'),
            timeSlots,
            note: cleanedNote,
            ...(item.id && typeof item.id === 'number' && item.id > 0 ? { id: item.id } : {})
          };
        })
      };
      
      console.log('Form data for edit modal:', formData);
      console.log('Item requests with IDs:', formData.itemRequests.map(item => ({ id: item.id, itemName: item.itemName })));
      form.setFieldsValue(formData);
      setVisible(true);
    } catch (error) {
      console.error('Error loading medication details for edit:', error);
      message.error('Không thể tải chi tiết yêu cầu thuốc để chỉnh sửa. Vui lòng thử lại.');
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    console.log('Form values submitted:', values);
    
    // Validate if the checkbox is confirmed
    if (!isConfirmed) {
      message.error('Vui lòng xác nhận thông tin thuốc là chính xác');
      return;
    }
    
    // Additional validation for student selection
    if (!values.studentId) {
      message.error('Vui lòng chọn học sinh');
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      // Format today's date in YYYY-MM-DD
      const today = dayjs().format('YYYY-MM-DD');
      
      // Check if we have medication items
      if (!Array.isArray(values.itemRequests) || values.itemRequests.length === 0) {
        message.error('Vui lòng thêm ít nhất một loại thuốc');
        setLoading(false);
        return;
      }
      
      // Validate that each medication item has time slots specified
      let hasInvalidTimeSlots = false;
      values.itemRequests.forEach((item, index) => {
        if (!item.timeSlots || item.timeSlots.length === 0) {
          message.error(`Vui lòng chỉ định thời gian uống thuốc cho thuốc #${index + 1}`);
          hasInvalidTimeSlots = true;
        }
      });
      
      if (hasInvalidTimeSlots) {
        setLoading(false);
        return;
      }
      
      // Prepare data for API according to the expected format
      const medicationData = {
        studentId: values.studentId,
        requestDate: today,
        note: values.note || "Yêu cầu dùng thuốc cho học sinh",
        itemRequests: values.itemRequests.map((item, index) => {
          // Format schedule times in HH:mm format
          let scheduleTimes = [];
          if (item.timeSlots && item.timeSlots.length > 0) {
            scheduleTimes = item.timeSlots.map(time => time.format('HH:mm'));
          }

          // Validate schedule times
          if (!scheduleTimes || scheduleTimes.length === 0) {
            throw new Error(`Vui lòng thiết lập thời gian sử dụng thuốc cho ${item.itemName || `thuốc #${index + 1}`}`);
          }
          if (scheduleTimes.length !== parseInt(item.frequency)) {
            throw new Error(`Số lượng thời gian sử dụng thuốc cho ${item.itemName || `thuốc #${index + 1}`} phải khớp với tần suất (${item.frequency})`);
          }

          // Process note and schedule time JSON
          const noteStr = item.note?.trim() || '';
          const scheduleTimeJson = {
            scheduleTimes
          };

          const processedItem = {
            ...(item.id && typeof item.id === 'number' && item.id > 0 ? { id: item.id } : {}),            
            itemName: item.itemName,
            purpose: item.purpose,
            itemType: item.itemType,
            dosage: parseFloat(item.dosage),
            frequency: parseInt(item.frequency, 10),
            startDate: item.startDate.format('YYYY-MM-DD'),
            endDate: item.endDate.format('YYYY-MM-DD'),
            // Properly separate note and schedule time JSON with a clear marker
            note: noteStr ? `${noteStr} scheduleTimeJson:${JSON.stringify(scheduleTimeJson)}` : `scheduleTimeJson:${JSON.stringify(scheduleTimeJson)}`,
            scheduleTimes
          };

          console.log(`Processing item ${index}:`, {
            original: item,
            processed: processedItem,
            hasValidId: item.id && typeof item.id === 'number' && item.id > 0
          });

          return processedItem;
        })
      };
      
      console.log('Sending medication data to API:', medicationData);
      console.log('itemRequests with IDs:', medicationData.itemRequests);
      
      if (isEdit) {
        // Update existing request
        console.log('Updating medication request with ID:', currentMedication.id);
        
        // Validate that only PENDING requests can be updated
        if (currentMedication.status !== 'PENDING') {
          message.error('Chỉ có thể chỉnh sửa yêu cầu thuốc đang chờ duyệt');
          setLoading(false);
          return;
        }

        // Validate schedule times for each item
        const hasInvalidSchedule = medicationData.itemRequests.some((item, index) => {
          if (!item.scheduleTimes || !Array.isArray(item.scheduleTimes) || item.scheduleTimes.length === 0) {
            message.error(`Vui lòng thiết lập thời gian sử dụng thuốc cho ${item.itemName || `thuốc #${index + 1}`}`);
            return true;
          }
          if (item.scheduleTimes.length !== Number(item.frequency)) {
            message.error(`Số lượng thời gian sử dụng thuốc cho ${item.itemName || `thuốc #${index + 1}`} phải khớp với tần suất (${item.frequency})`);
            return true;
          }
          return false;
        });

        if (hasInvalidSchedule) {
          setLoading(false);
          return;
        }
        
        try {
          const updatedRequest = await parentApi.updateMedicationRequest(token, currentMedication.id, medicationData);
          console.log('Updated medication request response:', updatedRequest);
          
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
          
          message.success('Cập nhật yêu cầu thuốc thành công');
        } catch (apiError) {
          console.error('API Error during update:', apiError);
          
          // Display specific error message from API
          if (apiError.message) {
            message.error(apiError.message);
          } else {
            message.error('Có lỗi xảy ra khi cập nhật yêu cầu thuốc. Vui lòng thử lại sau.');
          }
          
          setLoading(false);
          return;
        }
      } else {
        // Create new request
        const newRequest = await parentApi.createMedicationRequest(token, medicationData);
        console.log('New medication request response:', newRequest);
        
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
        
        message.success('Tạo yêu cầu thuốc mới thành công');
      }
      
      // Close the modal
      setVisible(false);
    } catch (error) {
      console.error('Error submitting medication request:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
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
      if (medicationToDelete.status !== 'PENDING') {
        message.error('Chỉ có thể xóa yêu cầu thuốc đang chờ duyệt');
        setLoading(false);
        return;
      }
      
      console.log('Deleting medication request with ID:', id);
      
      // Optimistic update - remove from UI immediately
      const previousRequests = medicationRequests;
      setMedicationRequests(prev => prev.filter(req => req.id !== id));
      
      try {
        await parentApi.deleteMedicationRequest(token, id);
        console.log('Successfully deleted medication request');
        message.success('Xóa yêu cầu thuốc thành công');
        
      } catch (apiError) {
        console.error('API Error during deletion:', apiError);
        
        // Rollback optimistic update on error
        setMedicationRequests(previousRequests);
        
        // Display specific error message from API
        if (apiError.message) {
          message.error(apiError.message);
        } else {
          message.error('Có lỗi xảy ra khi xóa yêu cầu thuốc. Vui lòng thử lại sau.');
        }
      }
      
    } catch (error) {
      console.error('Error deleting medication request:', error);
      message.error('Có lỗi xảy ra khi xóa yêu cầu thuốc');
    } finally {
      setLoading(false);
    }
  };

  // Handle view detail
  const handleViewDetail = async (record) => {
    console.log('View details button clicked for record:', record);
    
    try {
      // Fetch detailed medication request data from backend
      const token = getToken();
      console.log('Fetching details for medication request ID:', record.id);
      
      const detailedData = await parentApi.getMedicationRequestDetails(token, record.id);
      console.log('Detailed medication data received:', detailedData);
      
      // Use the detailed data from backend, fallback to record data if needed
      const medicationData = detailedData || record;
      const items = medicationData.itemRequests || [];
      
      console.log('Items to display:', items);
      
      // Set the data and show the modal
      setSelectedMedicationDetail(medicationData);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error fetching medication details:', error);
      message.error('Không thể tải chi tiết yêu cầu thuốc. Vui lòng thử lại.');
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

  // Validation functions
  const validateStartDate = (date) => {
    if (!date) return Promise.resolve();
    
    const today = dayjs().startOf('day');
    if (date.isBefore(today)) {
      return Promise.reject(new Error('Ngày bắt đầu không thể là ngày trong quá khứ'));
    }
    return Promise.resolve();
  };
  const validateEndDate = (date, itemIndex, form) => {
    if (!date) return Promise.resolve();
    
    // Get start date for this specific item
    const startDate = form.getFieldValue(['itemRequests', itemIndex, 'startDate']);
    if (startDate && date.isBefore(startDate)) {
      return Promise.reject(new Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'));
    }
    
    const today = dayjs().startOf('day');
    if (date.isBefore(today)) {
      return Promise.reject(new Error('Ngày kết thúc không thể là ngày trong quá khứ'));
    }
    return Promise.resolve();
  };

  const validateTimeSlot = (time) => {
    if (!time) return Promise.reject(new Error('Vui lòng chọn thời gian'));
    return Promise.resolve();
  };

  const disabledDate = (current) => {
    // Disable all dates before today
    return current && current.isBefore(dayjs().startOf('day'));
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
    validateStartDate,
    validateEndDate,
    validateTimeSlot,
    disabledDate,
    fetchData
  };
};
