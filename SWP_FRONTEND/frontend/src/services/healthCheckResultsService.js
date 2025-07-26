import healthCheckApi from '../api/healthCheckApi';
import { message } from 'antd';

/**
 * Service for handling health check results related API calls
 */
class HealthCheckResultsService {
  /**
   * Fetch confirmed students for a campaign
   * @param {string} campaignId - The campaign ID
   * @returns {Promise<Array>} Array of confirmed students
   */
  async getConfirmedStudents(campaignId) {
    try {
      console.log('Making API call to getConfirmedStudents with campaignId:', campaignId);
      const students = await healthCheckApi.getConfirmedStudents(campaignId);
      console.log('API call successful - confirmed students response:', students);
      return students || [];
    } catch (error) {
      console.error('Error fetching confirmed students:', error);
      message.error('Không thể tải danh sách học sinh đã xác nhận');
      return [];
    }
  }

  /**
   * Fetch existing health check results for a campaign
   * @param {string} campaignId - The campaign ID
   * @returns {Promise<Object>} Map of studentId to results
   */
  async getCampaignResults(campaignId) {
    try {
      console.log('Fetching existing health check results for campaign:', campaignId);
      const results = await healthCheckApi.getCampaignResults(campaignId);
      console.log('Existing results response:', results);

      // Create a map of studentId -> true for students who have results
      const resultsMap = {};
      if (results && Array.isArray(results)) {
        results.forEach((result) => {
          if (result.studentID) {
            resultsMap[result.studentID] = result;
            console.log(`Student ${result.studentID} has existing results:`, result);
          }
        });
      }
      console.log('Final existingResults map:', resultsMap);
      return resultsMap;
    } catch (error) {
      console.error('Error fetching campaign results:', error);
      message.error('Không thể tải kết quả khám sức khỏe');
      return {};
    }
  }

  /**
   * Record health check result for a student
   * @param {Object} resultData - The health check result data
   * @returns {Promise<boolean>} Success status
   */
  async recordHealthCheckResult(resultData) {
    try {
      console.log('DEBUG: Sending data to backend:', JSON.stringify(resultData, null, 2));
      await healthCheckApi.recordHealthCheckResult(resultData);
      message.success('Ghi nhận kết quả khám sức khỏe thành công!');
      return true;
    } catch (error) {
      console.error('Error recording health check result:', error);
      
      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error;
        
        if (status === 400) {
          if (errorMessage && errorMessage.includes('Duplicate')) {
            message.error('Học sinh này đã có kết quả khám sức khỏe. Không thể tạo kết quả mới.');
          } else if (errorMessage && errorMessage.includes('constraint')) {
            message.error('Có lỗi ràng buộc dữ liệu. Vui lòng kiểm tra lại thông tin.');
          } else {
            message.error(errorMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập.');
          }
        } else if (status === 404) {
          message.error('Không tìm thấy chiến dịch hoặc học sinh.');
        } else if (status === 500) {
          message.error('Lỗi máy chủ. Vui lòng liên hệ quản trị viên.');
        } else {
          message.error(errorMessage || 'Có lỗi xảy ra khi ghi nhận kết quả. Vui lòng thử lại.');
        }
      } else if (error.request) {
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        message.error('Có lỗi xảy ra khi ghi nhận kết quả. Vui lòng thử lại.');
      }
      
      return false;
    }
  }

  /**
   * Transform form data to backend DTO structure
   * @param {Object} formData - Form data from UI
   * @param {Object} selectedStudent - Selected student
   * @param {Object} campaign - Campaign data
   * @returns {Object} Transformed data for backend
   */
  transformFormDataToDTO(formData, selectedStudent, campaign) {
    // Add overall student measurements
    const overallMeasurements = {
      weight: formData.weight || 0,
      height: formData.height || 0,
    };

    // Transform and clean form data for backend compatibility
    const cleanedFormData = { ...formData };
    
    // Ensure hearing data has proper integer values
    if (cleanedFormData.HEARING) {
      cleanedFormData.HEARING = {
        ...cleanedFormData.HEARING,
        leftEar: parseInt(cleanedFormData.HEARING.leftEar) || 0,
        rightEar: parseInt(cleanedFormData.HEARING.rightEar) || 0,
      };
    }

    // Find the primary category with the most data to submit as main category
    // This works around the backend constraint issue
    const categoriesWithData = campaign.categories.filter(category => {
      const categoryData = cleanedFormData[category];
      if (!categoryData) return false;
      
      // Check if category has meaningful data
      const hasData = Object.keys(categoryData).some(key => {
        const value = categoryData[key];
        if (key === 'dateOfExamination') return true; // Always include date
        if (typeof value === 'boolean') return value; // Include if true
        if (typeof value === 'number') return value > 0; // Include if > 0
        if (typeof value === 'string') return value.trim().length > 0; // Include if not empty
        return false;
      });
      
      return hasData;
    });

    // **UPDATED: Process ALL categories with data instead of just primary**
    console.log('Categories with data:', categoriesWithData);
    
    if (categoriesWithData.length === 0) {
      throw new Error('Không có dữ liệu hợp lệ để lưu');
    }

    // Create category results for ALL categories with data
    const categoryResults = categoriesWithData.map(category => {
      const categoryData = cleanedFormData[category];
      let status = "NORMAL";

      // Determine status based on category-specific abnormal flags
      if (categoryData) {
        if (
          category === "ORAL" ||
          category === "SKIN" ||
          category === "RESPIRATORY"
        ) {
          if (categoryData.isAbnormal) {
            status = categoryData.treatment ? "NEEDS_TREATMENT" : "ABNORMAL";
          }
        } else if (category === "VISION") {
          // Consider abnormal if vision is below normal threshold or needs glasses
          if (
            categoryData.visionLeft < 1.0 ||
            categoryData.visionRight < 1.0 ||
            categoryData.needsGlasses ||
            categoryData.isAbnormal
          ) {
            status = "ABNORMAL";
          }
        } else if (category === "HEARING") {
          // Consider abnormal if hearing threshold is above normal
          if (
            categoryData.leftEar > 25 ||
            categoryData.rightEar > 25 ||
            categoryData.isAbnormal
          ) {
            status = "ABNORMAL";
          }
        }
      }

      return {
        category: category,
        status: status,
        notes: categoryData?.description || 
               categoryData?.visionDescription || 
               categoryData?.recommendations || ""
      };
    });

    console.log('Processing', categoryResults.length, 'categories:', categoryResults.map(c => c.category));

    // Set primary category (first one or abnormal one)
    const primaryCategory = categoriesWithData.find(category => {
      const categoryData = cleanedFormData[category];
      return categoryData && categoryData.isAbnormal;
    }) || categoriesWithData[0];

    // Ensure we send all categories to backend
    return {
      studentId: selectedStudent.studentID,
      campaignId: campaign.id,
      categories: categoryResults, // Now contains ALL categories
      weight: overallMeasurements.weight,
      height: overallMeasurements.height,
      detailedResults: cleanedFormData, // Include all form data for backend processing
      // Add flags to indicate this is a comprehensive submission
      isComprehensiveSubmission: true,
      primaryCategory: primaryCategory,
      // Include metadata for user feedback
      categorySelectionInfo: {
        totalCategories: categoriesWithData.length,
        allCategories: categoriesWithData,
        selectionReason: 'all_categories'
      },
    };
  }
}

export default new HealthCheckResultsService();
