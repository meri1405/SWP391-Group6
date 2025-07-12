import { message } from 'antd';
import { healthCheckApi } from '../api/healthCheckApi';

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
}

// Export singleton instance
export const healthCheckCampaignService = new HealthCheckCampaignService();
