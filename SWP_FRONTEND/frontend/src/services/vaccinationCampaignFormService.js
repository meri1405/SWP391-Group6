import { message } from "antd";
import { nurseApi } from "../api/nurseApi";
import { vaccinationCampaignApi } from "../api/vaccinationCampaignApi";

/**
 * Service class for vaccination campaign form operations
 * Handles all API calls and data transformations for the VaccinationCampaignForm component
 */
export class VaccinationCampaignFormService {
  /**
   * Fetch all vaccination rules
   * @returns {Promise<Array>} Array of vaccination rules
   */
  static async fetchVaccinationRules() {
    try {
      const rules = await nurseApi.getAllVaccinationRules();
      return rules;
    } catch (error) {
      message.error("Không thể tải danh sách quy tắc tiêm chủng");
      console.error("Error fetching vaccination rules:", error);
      throw error;
    }
  }

  /**
   * Calculate estimated vaccine count for a vaccination rule
   * @param {number} ruleId - The vaccination rule ID
   * @returns {Promise<number>} The number of eligible students
   */
  static async calculateEstimatedVaccineCount(ruleId) {
    try {
      const response = await vaccinationCampaignApi.getEligibleStudentsCountByRule(ruleId);
      const eligibleCount = response.eligibleCount || 0;

      if (eligibleCount > 0) {
        message.success(
          `Tìm thấy ${eligibleCount} học sinh thỏa mãn điều kiện tiêm chủng`
        );
      } else {
        message.info(
          "Không có học sinh nào thỏa mãn điều kiện tiêm chủng hiện tại"
        );
      }

      return eligibleCount;
    } catch (error) {
      console.error("Error calculating estimated vaccine count:", error);
      message.error("Không thể tính toán số lượng vaccine dự kiến");
      throw error;
    }
  }

  /**
   * Create a new vaccination campaign
   * @param {Object} campaignData - Campaign data to create
   * @returns {Promise<Object>} Created campaign data
   */
  static async createCampaign(campaignData) {
    try {
      const result = await vaccinationCampaignApi.createCampaign(campaignData);
      message.success("Tạo chiến dịch tiêm chủng mới thành công");
      return result;
    } catch (error) {
      message.error("Không thể tạo chiến dịch tiêm chủng");
      console.error("Error creating campaign:", error);
      throw error;
    }
  }

  /**
   * Update an existing vaccination campaign
   * @param {number} campaignId - ID of the campaign to update
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} Updated campaign data
   */
  static async updateCampaign(campaignId, campaignData) {
    try {
      const result = await vaccinationCampaignApi.updateCampaign(campaignId, campaignData);
      message.success("Cập nhật chiến dịch tiêm chủng thành công");
      return result;
    } catch (error) {
      message.error("Không thể cập nhật chiến dịch tiêm chủng");
      console.error("Error updating campaign:", error);
      throw error;
    }
  }

  /**
   * Format campaign data for API submission
   * @param {Object} formValues - Form values from Ant Design form
   * @returns {Object} Formatted campaign data
   */
  static formatCampaignData(formValues) {
    return {
      ...formValues,
      scheduledDate: formValues.scheduledDate
        ? formValues.scheduledDate.format("YYYY-MM-DDTHH:mm:ss")
        : null,
    };
  }

  /**
   * Process vaccination rule selection and update form
   * @param {number} ruleId - Selected vaccination rule ID
   * @param {Array} vaccinationRules - Array of all vaccination rules
   * @returns {Object} Additional info and vaccine brand to set in form
   */
  static processRuleSelection(ruleId, vaccinationRules) {
    const selectedRule = vaccinationRules.find((rule) => rule.id === ruleId);
    
    if (!selectedRule) {
      return null;
    }

    return {
      vaccineBrand: "", // Clear any previous brand to let user specify
      additionalInfo: `Vắc xin ${selectedRule.name}, liều ${
        selectedRule.doesNumber
      }.\n${selectedRule.description || ""}`,
    };
  }

  /**
   * Handle form submission (create or update)
   * @param {Object} formValues - Form values
   * @param {boolean} isEditing - Whether this is an edit operation
   * @param {Object} campaign - Existing campaign data (for edit)
   * @returns {Promise<Object>} Result of the operation
   */
  static async submitForm(formValues, isEditing, campaign = null) {
    const campaignData = this.formatCampaignData(formValues);

    if (isEditing && campaign) {
      return await this.updateCampaign(campaign.id, campaignData);
    } else {
      return await this.createCampaign(campaignData);
    }
  }
}
