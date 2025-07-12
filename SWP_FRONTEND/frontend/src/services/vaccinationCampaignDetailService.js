import { message } from "antd";
import { vaccinationCampaignApi } from "../api/vaccinationCampaignApi";

export class VaccinationCampaignDetailService {
  /**
   * Fetch all campaign data including campaign details, students, forms, and records
   */
  static async fetchCampaignData(campaignId) {
    try {
      const campaignData = await vaccinationCampaignApi.getCampaignById(campaignId);
      
      let eligibleStudents = { eligibleStudents: [], ineligibleStudents: [] };
      let forms = [];
      let records = [];

      // Only fetch eligible students if campaign is approved, in progress, or completed
      if (
        campaignData.status === "APPROVED" ||
        campaignData.status === "IN_PROGRESS" ||
        campaignData.status === "COMPLETED"
      ) {
        try {
          const students = await vaccinationCampaignApi.getEligibleStudents(campaignId);
          eligibleStudents = students;
        } catch (studentError) {
          console.error("Error fetching eligible students:", studentError);
          message.error("Không thể tải danh sách học sinh đủ điều kiện tiêm chủng");
        }
      }

      // Fetch forms
      try {
        const formsData = await vaccinationCampaignApi.getCampaignForms(campaignId);
        forms = formsData;
      } catch (formsError) {
        console.error("Error fetching forms:", formsError);
        message.error("Không thể tải danh sách mẫu đơn tiêm chủng");
      }

      // Fetch records
      try {
        const recordsData = await vaccinationCampaignApi.getCampaignRecords(campaignId);
        records = recordsData;
      } catch (recordsError) {
        console.error("Error fetching vaccination records:", recordsError);
        message.error("Không thể tải danh sách kết quả tiêm chủng");
      }

      return {
        campaign: campaignData,
        eligibleStudents,
        forms,
        records
      };
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      message.error("Không thể tải thông tin chi tiết chiến dịch");
      throw error;
    }
  }

  /**
   * Generate vaccination forms for eligible students
   */
  static async generateForms(campaignId, campaignStatus) {
    if (campaignStatus !== "APPROVED") {
      message.error("Chỉ có thể tạo mẫu đơn cho chiến dịch đã được duyệt");
      throw new Error("Invalid campaign status for form generation");
    }

    try {
      await vaccinationCampaignApi.generateForms(campaignId);
      message.success("Đã tạo mẫu đơn tiêm chủng cho học sinh đủ điều kiện");
    } catch (error) {
      console.error("Error generating forms:", error);
      message.error("Không thể tạo mẫu đơn tiêm chủng");
      throw error;
    }
  }

  /**
   * Send vaccination forms to parents
   */
  static async sendFormsToParents(campaignId, campaignStatus) {
    if (campaignStatus !== "APPROVED" && campaignStatus !== "IN_PROGRESS") {
      message.error("Chỉ có thể gửi mẫu đơn cho chiến dịch đã được duyệt hoặc đang thực hiện");
      throw new Error("Invalid campaign status for sending forms");
    }

    try {
      await vaccinationCampaignApi.sendFormsToParents(campaignId);
      message.success("Đã gửi mẫu đơn tiêm chủng đến phụ huynh");
    } catch (error) {
      console.error("Error sending forms:", error);
      message.error("Không thể gửi mẫu đơn tiêm chủng");
      throw error;
    }
  }

  /**
   * Request campaign completion
   */
  static async requestCampaignCompletion(campaignId, campaignStatus, statistics) {
    if (campaignStatus !== "IN_PROGRESS") {
      message.error("Chỉ có thể hoàn thành chiến dịch đang thực hiện");
      throw new Error("Invalid campaign status for completion");
    }

    try {
      // Test authentication first
      try {
        await vaccinationCampaignApi.testNurseAuth();
      } catch (authError) {
        console.error("Auth test failed:", authError);
        const errorMsg = "Lỗi xác thực: " + (authError.response?.data?.message || "Không có quyền truy cập");
        message.error(errorMsg);
        throw new Error(errorMsg);
      }

      const requestData = {
        requestReason: "Yêu cầu hoàn thành chiến dịch tiêm chủng",
        completionNotes: `Tổng số học sinh đã tiêm: ${statistics.completedRecords}. Số học sinh hoãn tiêm: ${statistics.postponedRecords}. Số mẫu đơn chưa xác nhận: ${statistics.pendingForms}.`,
      };

      const response = await vaccinationCampaignApi.requestCampaignCompletion(campaignId, requestData);

      if (response.success) {
        message.success("Đã gửi yêu cầu hoàn thành chiến dịch đến quản lý để duyệt");
      } else {
        message.warning(response.message || "Yêu cầu hoàn thành đã được gửi");
      }

      return response;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không thể gửi yêu cầu hoàn thành chiến dịch";
      
      console.error("Error requesting campaign completion:", error);
      message.error(errorMessage);
      throw error;
    }
  }

  /**
   * Create vaccination record
   */
  static async createVaccinationRecord(formId, recordData, campaignStatus) {
    if (campaignStatus !== "IN_PROGRESS") {
      message.error("Chỉ có thể ghi nhận kết quả tiêm chủng cho chiến dịch đang thực hiện");
      throw new Error("Invalid campaign status for vaccination recording");
    }

    try {
      await vaccinationCampaignApi.createVaccinationRecord(formId, recordData);
      message.success("Đã ghi nhận kết quả tiêm chủng");
    } catch (error) {
      console.error("Error creating vaccination record:", error);
      message.error("Không thể ghi nhận kết quả tiêm chủng");
      throw error;
    }
  }

  /**
   * Update vaccination record notes
   */
  static async updateVaccinationRecordNotes(recordId, notes, campaignStatus) {
    if (!["APPROVED", "IN_PROGRESS", "COMPLETED"].includes(campaignStatus)) {
      message.error("Không thể cập nhật ghi chú cho chiến dịch với trạng thái hiện tại");
      throw new Error("Invalid campaign status for updating notes");
    }

    try {
      await vaccinationCampaignApi.updateVaccinationRecord(recordId, { notes });
      message.success("Đã cập nhật ghi chú thành công");
    } catch (error) {
      console.error("Error updating vaccination record notes:", error);
      message.error("Không thể cập nhật ghi chú");
      throw error;
    }
  }
}