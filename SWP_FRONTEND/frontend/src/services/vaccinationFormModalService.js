import { parentApi } from "../api/parentApi";

/**
 * Service class for vaccination form modal operations
 * Handles all API calls related to vaccination form management
 */
export class VaccinationFormModalService {
  /**
   * Fetch vaccination form by ID
   * @param {string} vaccinationFormId - The vaccination form ID
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} API response containing form data
   */
  static async getVaccinationFormById(vaccinationFormId, token) {
    try {
      const response = await parentApi.getVaccinationFormById(
        vaccinationFormId,
        token
      );
      return response;
    } catch (error) {
      console.error("Error loading vaccination form:", error);
      throw new Error("Không thể tải thông tin phiếu tiêm chủng");
    }
  }

  /**
   * Confirm vaccination form
   * @param {string} vaccinationFormId - The vaccination form ID
   * @param {string} notes - Parent notes
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} API response
   */
  static async confirmVaccinationForm(vaccinationFormId, notes, token) {
    try {
      const response = await parentApi.confirmVaccinationForm(
        vaccinationFormId,
        notes,
        token
      );
      return response;
    } catch (error) {
      console.error("Error confirming vaccination form:", error);
      throw new Error("Không thể xác nhận phiếu tiêm chủng");
    }
  }

  /**
   * Decline vaccination form
   * @param {string} vaccinationFormId - The vaccination form ID
   * @param {string} notes - Parent notes (required for decline)
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} API response
   */
  static async declineVaccinationForm(vaccinationFormId, notes, token) {
    try {
      const response = await parentApi.declineVaccinationForm(
        vaccinationFormId,
        notes,
        token
      );
      return response;
    } catch (error) {
      console.error("Error declining vaccination form:", error);
      throw new Error("Không thể từ chối phiếu tiêm chủng");
    }
  }
}
