import { nurseApi } from '../api/nurseApi';

/**
 * Service for managing vaccination rules API interactions
 */
export class VaccinationRuleService {
  /**
   * Get all vaccination rules
   * @returns {Promise<Array>} List of vaccination rules
   */
  static async getAllVaccinationRules() {
    try {
      return await nurseApi.getAllVaccinationRules();
    } catch (error) {
      console.error("Error loading vaccination rules:", error);
      throw new Error("Không thể tải danh sách quy tắc tiêm chủng");
    }
  }

  /**
   * Create a new vaccination rule
   * @param {Object} ruleData - The vaccination rule data
   * @returns {Promise<Object>} Created vaccination rule
   */
  static async createVaccinationRule(ruleData) {
    try {
      const result = await nurseApi.createVaccinationRule(ruleData);
      return result;
    } catch (error) {
      console.error("Error creating vaccination rule:", error);
      throw new Error("Có lỗi xảy ra khi tạo quy tắc tiêm chủng");
    }
  }

  /**
   * Update an existing vaccination rule
   * @param {number} id - Rule ID
   * @param {Object} ruleData - Updated rule data
   * @returns {Promise<Object>} Updated vaccination rule
   */
  static async updateVaccinationRule(id, ruleData) {
    try {
      const result = await nurseApi.updateVaccinationRule(id, ruleData);
      return result;
    } catch (error) {
      console.error("Error updating vaccination rule:", error);
      throw new Error("Có lỗi xảy ra khi cập nhật quy tắc tiêm chủng");
    }
  }

  /**
   * Delete a vaccination rule
   * @param {number} id - Rule ID to delete
   * @returns {Promise<void>}
   */
  static async deleteVaccinationRule(id) {
    try {
      await nurseApi.deleteVaccinationRule(id);
    } catch (error) {
      console.error("Error deleting vaccination rule:", error);
      throw new Error("Có lỗi xảy ra khi xóa quy tắc tiêm chủng");
    }
  }

  /**
   * Prepare rule data for API submission
   * @param {Object} formValues - Form values from the modal
   * @returns {Object} Formatted rule data
   */
  static prepareRuleData(formValues) {
    return {
      name: formValues.name,
      description: formValues.description,
      doesNumber: formValues.doesNumber,
      minAge: formValues.minAge,
      maxAge: formValues.maxAge,
      intervalDays: formValues.intervalDays,
      mandatory: formValues.mandatory || false,
    };
  }
}
