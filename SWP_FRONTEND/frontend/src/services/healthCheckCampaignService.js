import { message } from 'antd';
import { healthCheckApi } from '../api/healthCheckApi';
import { getAvailableClassNames } from '../api/studentApi';

/**
 * Service class for handling health check campaign operations
 * Separates API calls from component logic
 */
class HealthCheckCampaignService {
  /**
   * Fetch campaign details by ID
   */
  async getCampaignDetails(campaignId) {
    try {
      const campaignData = await healthCheckApi.getCampaignById(campaignId);
      return { data: campaignData, error: null };
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      return { data: null, error: 'Không thể tải thông tin chi tiết đợt khám' };
    }
  }

  /**
   * Fetch campaign results
   */
  async getCampaignResults(campaignId) {
    try {
      console.log('Fetching results for campaign:', campaignId);
      const data = await healthCheckApi.getCampaignResults(campaignId);
      console.log('Results fetched:', data.length, 'students');
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching campaign results:', error);
      return { data: [], error: 'Không thể tải kết quả khám sức khỏe' };
    }
  }

  /**
   * Fetch eligible students with form status
   */
  async getEligibleStudentsWithFormStatus(campaignId) {
    try {
      console.log('fetchEligibleStudents called with campaignId:', campaignId);
      const data = await healthCheckApi.getEligibleStudentsWithFormStatus(campaignId);
      console.log('Eligible students with form status fetched:', data.length);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching eligible students:', error);
      return { data: [], error: 'Không thể tải danh sách học sinh đủ điều kiện' };
    }
  }

  /**
   * Start a campaign
   */
  async startCampaign(campaignId) {
    try {
      const response = await healthCheckApi.startCampaign(campaignId);
      message.success('Đã bắt đầu đợt khám');
      return { data: response, error: null };
    } catch (error) {
      console.error('Error starting campaign:', error);
      return { data: null, error: `Không thể thực hiện hành động: ${error.message}` };
    }
  }

  /**
   * Complete a campaign
   */
  async completeCampaign(campaignId) {
    try {
      const response = await healthCheckApi.completeCampaign(campaignId);
      message.success('Đã hoàn thành đợt khám');
      return { data: response, error: null };
    } catch (error) {
      console.error('Error completing campaign:', error);
      return { data: null, error: `Không thể thực hiện hành động: ${error.message}` };
    }
  }

  /**
   * Schedule a campaign
   */
  async scheduleCampaign(campaignId, scheduleData) {
    try {
      console.log('Scheduling campaign with data:', scheduleData);
      const response = await healthCheckApi.scheduleCampaign(campaignId, scheduleData);
      message.success('Đã lên lịch khám thành công');
      return { data: response, error: null };
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      return { 
        data: null, 
        error: 'Không thể lên lịch khám: ' + (error.response?.data?.message || error.message) 
      };
    }
  }

  /**
   * Generate forms for eligible students
   */
  async generateForms(campaignId) {
    try {
      console.log('Step 1: Generating health check forms...');
      message.loading('Đang tạo phiếu khám sức khỏe...', 0);
      
      const formsResponse = await healthCheckApi.generateForms(campaignId);
      console.log('Forms generated:', formsResponse);
      
      message.destroy();
      return { data: formsResponse, error: null };
    } catch (error) {
      message.destroy();
      console.error('Error generating forms:', error);
      return { data: null, error: 'Không thể tạo phiếu khám sức khỏe' };
    }
  }

  /**
   * Send notifications to parents
   */
  async sendNotificationsToParents(campaignId, customMessage = null) {
    try {
      const messageToSend = customMessage && customMessage.trim().length > 0 ? customMessage : null;
      
      console.log('Step 2: Sending notifications to parents...');
      console.log('Using custom message:', messageToSend ? 'Yes' : 'No (using default template)');
      message.loading('Đang gửi thông báo đến phụ huynh...', 0);
      
      const notificationResponse = await healthCheckApi.sendNotificationsToParents(campaignId, messageToSend);
      console.log('Notification response:', notificationResponse);
      
      message.destroy();
      return { data: notificationResponse, error: null };
    } catch (error) {
      message.destroy();
      console.error('Error sending notifications:', error);
      
      let errorMessage = 'Không thể gửi thông báo đến phụ huynh';
      if (error.response?.status === 401) {
        errorMessage = 'Không có quyền thực hiện thao tác này';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Send health check result notifications
   */
  async sendHealthCheckResultNotifications(campaignId, studentIds, notificationContent, useDefaultTemplate) {
    try {
      const result = await healthCheckApi.sendHealthCheckResultNotifications(
        campaignId, 
        studentIds, 
        notificationContent, 
        useDefaultTemplate
      );
      message.success(`Đã gửi thông báo kết quả khám sức khỏe cho ${result.sentCount} phụ huynh`);
      return { data: result, error: null };
    } catch (error) {
      console.error('Error sending health check result notifications:', error);
      return { data: null, error: 'Không thể gửi thông báo kết quả khám sức khỏe. Vui lòng thử lại sau.' };
    }
  }

  /**
   * Fetch available health check categories
   * @returns {Promise<Array>} Array of available categories
   */
  async fetchCategories() {
    try {
      const categories = await healthCheckApi.getAvailableCategories();
      return categories;
    } catch (error) {
      message.error('Không thể tải danh sách loại khám sức khỏe');
      console.error('Error fetching health check categories:', error);
      // Return some default categories for development
      return ['VISION', 'HEARING', 'ORAL', 'SKIN', 'RESPIRATORY'];
    }
  }

  /**
   * Fetch available class names
   * @returns {Promise<Array>} Array of available class names
   */
  async fetchAvailableClasses() {
    try {
      const classes = await getAvailableClassNames();
      return classes;
    } catch (error) {
      console.error('Error fetching available classes:', error);
      message.error('Không thể tải danh sách lớp học. Sử dụng danh sách mặc định.');
      // Fallback to some default classes if API fails
      return [
        'Mầm non', '1A', '1B', '1C', '2A', '2B', '2C', 
        '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B', '5C'
      ];
    }
  }

  /**
   * Calculate target count for health check campaign
   * @param {number|null} minAge - Minimum age
   * @param {number|null} maxAge - Maximum age
   * @param {Array} targetClasses - Array of target classes
   * @returns {Promise<number>} Target count
   */
  async calculateTargetCount(minAge, maxAge, targetClasses) {
    console.log('Service calculateTargetCount called with:', {
      minAge,
      maxAge,
      targetClasses,
      targetClassesType: typeof targetClasses,
      targetClassesArray: Array.isArray(targetClasses)
    });
    
    // Only calculate if we have valid age range OR target classes
    if ((minAge && maxAge && minAge <= maxAge) || (targetClasses && targetClasses.length > 0)) {
      try {
        // If no classes are selected, default to "toàn trường" (whole school)
        const classesToUse = (targetClasses && targetClasses.length > 0) ? targetClasses : ["toàn trường"];
        console.log('Using classes:', classesToUse);
        
        // Pass age range for year-based age calculation (min <= age <= max)
        const result = await healthCheckApi.calculateTargetCount(
          minAge || null, 
          maxAge || null, 
          classesToUse
        );
        console.log('Service calculateTargetCount result:', result);
        return result.targetCount || 0;
      } catch (error) {
        console.error('Error calculating target count:', error);
        return 0;
      }
    } else {
      console.log('Skipping target count calculation - no valid criteria provided');
      return 0;
    }
  }

  /**
   * Create a new health check campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Promise<Object>} Created campaign result
   */
  async createCampaign(campaignData) {
    try {
      const result = await healthCheckApi.createCampaign(campaignData);
      message.success('Tạo đợt khám sức khỏe mới thành công');
      return result;
    } catch (error) {
      message.error('Không thể tạo đợt khám sức khỏe');
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Update an existing health check campaign
   * @param {string|number} campaignId - Campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} Updated campaign result
   */
  async updateCampaign(campaignId, campaignData) {
    try {
      const result = await healthCheckApi.updateCampaign(campaignId, campaignData);
      message.success('Cập nhật đợt khám sức khỏe thành công');
      return result;
    } catch (error) {
      message.error('Không thể cập nhật đợt khám sức khỏe');
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  /**
   * Prepare campaign data for API submission
   * @param {Object} formValues - Form values from the form
   * @returns {Object} Prepared campaign data
   */
  prepareCampaignData(formValues) {
    const [startDate, endDate] = formValues.dateRange || [];
    
    // If no classes are selected, default to "toàn trường" (whole school)
    const targetClasses = (formValues.targetClasses && formValues.targetClasses.length > 0) 
      ? formValues.targetClasses 
      : ["toàn trường"];
    
    const campaignData = {
      ...formValues,
      targetClasses,
      startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
      endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
    };
    
    // Remove dateRange field as it's not part of the backend DTO
    delete campaignData.dateRange;

    return campaignData;
  }
}

// Export singleton instance
export const healthCheckCampaignService = new HealthCheckCampaignService();
