import { message } from 'antd';
import dayjs from 'dayjs';
import { parentApi } from '../api/parentApi';

/**
 * Service for medication management API operations
 * Handles all medication-related API calls and data formatting
 */
export const medicationService = {
  /**
   * Fetch all medication requests for the authenticated parent
   * @param {string} token - Authentication token
   * @returns {Promise<Array>} Array of medication requests
   */
  async fetchMedicationRequests(token) {
    try {
      const medicationData = await parentApi.getMedicationRequests(token);
      
      // Ensure medication data is an array
      const validMedications = Array.isArray(medicationData)
        ? medicationData.filter(med => med && med.id)
        : [];
      
      console.log('Valid medications after filtering:', validMedications);
      
      // Map medication data to ensure it has the expected format
      const formattedMedications = validMedications.map(med => {
        // Make sure itemRequests is always an array
        if (!med.itemRequests) {
          med.itemRequests = [];
        }
        
        return med;
      });
      
      return formattedMedications;
    } catch (error) {
      console.error('Error fetching medication requests:', error);
      message.error('Không thể tải dữ liệu yêu cầu thuốc. Vui lòng thử lại sau.');
      throw error;
    }
  },

  /**
   * Fetch detailed medication request by ID
   * @param {string} token - Authentication token
   * @param {number} requestId - Medication request ID
   * @returns {Promise<Object>} Detailed medication request
   */
  async fetchMedicationRequestDetails(token, requestId) {
    try {
      console.log('Fetching detailed data for medication request ID:', requestId);
      const detailedData = await parentApi.getMedicationRequestDetails(token, requestId);
      console.log('Detailed data from API:', detailedData);
      return detailedData;
    } catch (error) {
      console.error('Error fetching medication details:', error);
      message.error('Không thể tải chi tiết yêu cầu thuốc. Vui lòng thử lại.');
      throw error;
    }
  },

  /**
   * Create a new medication request
   * @param {string} token - Authentication token
   * @param {Object} medicationData - Medication request data
   * @returns {Promise<Object>} Created medication request
   */
  async createMedicationRequest(token, medicationData) {
    try {
      console.log('Creating new medication request with data:', medicationData);
      
      const formattedData = this.formatMedicationDataForAPI(medicationData);
      const newRequest = await parentApi.createMedicationRequest(token, formattedData);
      
      console.log('New medication request response:', newRequest);
      message.success('Tạo yêu cầu thuốc mới thành công');
      
      return newRequest;
    } catch (error) {
      console.error('Error creating medication request:', error);
      message.error('Có lỗi xảy ra khi tạo yêu cầu thuốc. Vui lòng thử lại sau.');
      throw error;
    }
  },

  /**
   * Update an existing medication request
   * @param {string} token - Authentication token
   * @param {number} requestId - Medication request ID
   * @param {Object} medicationData - Updated medication request data
   * @returns {Promise<Object>} Updated medication request
   */
  async updateMedicationRequest(token, requestId, medicationData) {
    try {
      console.log('Updating medication request with ID:', requestId);
      
      const formattedData = this.formatMedicationDataForAPI(medicationData);
      const updatedRequest = await parentApi.updateMedicationRequest(token, requestId, formattedData);
      
      console.log('Updated medication request response:', updatedRequest);
      message.success('Cập nhật yêu cầu thuốc thành công');
      
      return updatedRequest;
    } catch (apiError) {
      console.error('API Error during update:', apiError);
      
      // Display specific error message from API
      if (apiError.message) {
        message.error(apiError.message);
      } else {
        message.error('Có lỗi xảy ra khi cập nhật yêu cầu thuốc. Vui lòng thử lại sau.');
      }
      
      throw apiError;
    }
  },

  /**
   * Delete a medication request
   * @param {string} token - Authentication token
   * @param {number} requestId - Medication request ID
   * @returns {Promise<void>}
   */
  async deleteMedicationRequest(token, requestId) {
    try {
      console.log('Deleting medication request with ID:', requestId);
      
      await parentApi.deleteMedicationRequest(token, requestId);
      console.log('Successfully deleted medication request');
      message.success('Xóa yêu cầu thuốc thành công');
    } catch (apiError) {
      console.error('API Error during deletion:', apiError);
      
      // Display specific error message from API
      if (apiError.message) {
        message.error(apiError.message);
      } else {
        message.error('Có lỗi xảy ra khi xóa yêu cầu thuốc. Vui lòng thử lại sau.');
      }
      
      throw apiError;
    }
  },

  /**
   * Fetch students for the authenticated parent
   * @param {string} token - Authentication token
   * @returns {Promise<Array>} Array of students
   */
  async fetchStudents(token) {
    try {
      const studentsData = await parentApi.getMyStudents(token);
      
      // Filter out any students with null or undefined IDs
      const validStudents = Array.isArray(studentsData) 
        ? studentsData.filter(student => student && student.id).map(student => ({
            ...student,
            id: student.id  // Ensure ID consistency
          }))
        : [];
        
      console.log('Valid students after filtering:', validStudents);
      return validStudents;
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Không thể tải danh sách học sinh. Vui lòng thử lại sau.');
      throw error;
    }
  },

  /**
   * Format medication data for API submission
   * @param {Object} formData - Raw form data
   * @returns {Object} Formatted data for API
   */
  formatMedicationDataForAPI(formData) {
    // Format today's date in YYYY-MM-DD
    const today = dayjs().format('YYYY-MM-DD');
    
    // Extract base64 data from prescription images
    const prescriptionImages = formData.prescriptionImages 
      ? formData.prescriptionImages.map(img => img.url || img.thumbUrl)
      : [];
    
    // Prepare data for API according to the expected format
    const medicationData = {
      studentId: formData.studentId,
      requestDate: today,
      note: formData.note || "Yêu cầu dùng thuốc cho học sinh",
      prescriptionImages: prescriptionImages,
      itemRequests: formData.itemRequests.map((item, index) => {
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
          unit: item.unit || 'đơn vị',
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
    
    return medicationData;
  },

  /**
   * Format medication data for form editing
   * @param {Object} medicationData - Raw medication data from API
   * @returns {Object} Formatted data for form
   */
  formatMedicationDataForForm(medicationData) {
    // Format prescription images from base64 strings to upload component format
    const prescriptionImages = (medicationData.prescriptionImages || []).map((base64, index) => ({
      uid: `existing-${index}`,
      name: `prescription-${index + 1}.png`,
      status: 'done',
      url: base64,
      thumbUrl: base64,
    }));

    // Format the data for the form with proper item IDs
    const formData = {
      studentId: medicationData.studentId,
      note: medicationData.note,
      prescriptionImages: prescriptionImages,
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
    
    return formData;
  }
};
