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
      message.error('Có lỗi xảy ra khi ghi nhận kết quả. Vui lòng thử lại.');
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

    // Transform form data to match backend DTO structure
    const categoryResults = campaign.categories.map((category) => {
      const categoryData = formData[category];
      let status = "NORMAL";

      // Determine status based on category-specific abnormal flags
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

      return {
        category,
        status,
        notes:
          categoryData.description ||
          categoryData.visionDescription ||
          categoryData.recommendations ||
          "",
      };
    });

    return {
      studentId: selectedStudent.studentID,
      campaignId: campaign.id,
      categories: categoryResults,
      weight: overallMeasurements.weight,
      height: overallMeasurements.height,
      detailedResults: formData, // Include detailed form data for backend processing
    };
  }
}

export default new HealthCheckResultsService();
