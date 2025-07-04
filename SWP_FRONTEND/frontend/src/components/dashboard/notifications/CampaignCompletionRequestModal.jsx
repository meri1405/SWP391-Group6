import React from "react";
import "../../../styles/CampaignCompletionRequestModal.css";

const CampaignCompletionRequestModal = ({
  isOpen,
  completionRequest,
  onClose,
}) => {
  // Check if the completion request has already been processed
  const isRequestProcessed =
    completionRequest?.status === "APPROVED" ||
    completionRequest?.status === "REJECTED";
  const statusMessage =
    completionRequest?.status === "APPROVED"
      ? "Yêu cầu đã được phê duyệt"
      : completionRequest?.status === "REJECTED"
      ? "Yêu cầu đã bị từ chối"
      : null;

  // Helper function to extract statistics from completion request message
  const extractStatFromMessage = (message, type) => {
    if (!message) return "0";

    try {
      // More flexible patterns to match different message formats
      switch (type) {
        case "total": {
          // Try different patterns for total
          let totalMatch = message.match(
            /(?:Tổng số.*?học sinh.*?:?\s*)(\d+)/i
          );
          if (!totalMatch) totalMatch = message.match(/(?:tổng.*?:?\s*)(\d+)/i);
          if (totalMatch) {
            return totalMatch[1];
          }

          // If no explicit total, calculate from sum of all statuses
          const vaccinatedMatch = message.match(/(?:đã tiêm.*?:?\s*)(\d+)/i);
          const postponedMatch = message.match(/(?:hoãn.*?:?\s*)(\d+)/i);
          const pendingMatch = message.match(
            /(?:chưa.*?xác nhận.*?:?\s*)(\d+)/i
          );

          const vaccinated = vaccinatedMatch ? parseInt(vaccinatedMatch[1]) : 0;
          const postponed = postponedMatch ? parseInt(postponedMatch[1]) : 0;
          const pending = pendingMatch ? parseInt(pendingMatch[1]) : 0;

          const total = vaccinated + postponed + pending;
          return total.toString();
        }

        case "vaccinated": {
          const vacMatch = message.match(/(?:đã tiêm.*?:?\s*)(\d+)/i);
          const result = vacMatch ? vacMatch[1] : "0";
          return result;
        }

        case "postponed": {
          const postMatch = message.match(/(?:hoãn.*?:?\s*)(\d+)/i);
          const postponedResult = postMatch ? postMatch[1] : "0";
          return postponedResult;
        }

        case "pending": {
          const pendMatch = message.match(/(?:chưa.*?xác nhận.*?:?\s*)(\d+)/i);
          const pendingResult = pendMatch ? pendMatch[1] : "0";
          return pendingResult;
        }

        default:
          return "0";
      }
    } catch (error) {
      console.error("Error parsing completion request message:", error);
      return "0";
    }
  };

  // Helper functions to extract information from completion request
  const extractCampaignName = (completionRequest) => {
    if (!completionRequest) return "N/A";

    // Extract campaign name from title - remove prefix
    if (completionRequest.title?.includes("YÊU CẦU HOÀN THÀNH CHIẾN DỊCH:")) {
      const result = completionRequest.title
        .replace("YÊU CẦU HOÀN THÀNH CHIẾN DỊCH: ", "")
        .trim();
      return result;
    }

    // Try to extract from message
    const message = completionRequest.message || "";
    const campaignMatch = message.match(/chiến dịch '([^']+)'/i);
    if (campaignMatch) {
      return campaignMatch[1];
    }

    return "N/A";
  };

  const extractRequesterName = (completionRequest) => {
    if (!completionRequest) return "N/A";

    const message = completionRequest.message || "";

    // Try different patterns to extract nurse name
    // Pattern 1: "được tạo bởi Y tá [Full Name] yêu cầu" (handle multiple spaces)
    let nameMatch = message.match(
      /được tạo bởi\s+Y tá\s+([^yêu]+?)\s+yêu cầu/i
    );
    if (nameMatch) {
      return nameMatch[1].trim();
    }

    // Pattern 2: "Y tá [Full Name] yêu cầu" (handle multiple spaces)
    nameMatch = message.match(/Y tá\s+([^yêu]+?)\s+yêu cầu/i);
    if (nameMatch) {
      return nameMatch[1].trim();
    }

    // Pattern 3: "được tạo bởi [Full Name] yêu cầu" (without Y tá prefix)
    nameMatch = message.match(/được tạo bởi\s+([^yêu]+?)\s+yêu cầu/i);
    if (nameMatch && !nameMatch[1].includes("Y tá")) {
      return nameMatch[1].trim();
    }

    // Pattern 4: "tạo bởi Y tá [Name]"
    nameMatch = message.match(/tạo bởi\s+Y tá\s+([^yêu]+)/i);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    return "Y tá Trường học";
  };

  const formatFullDateTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString(); // No padding for hours
      const minutes = date.getMinutes().toString().padStart(2, "0");

      // Format as "YYYY MM DD H:MM" (ví dụ: "2025 07 02 1:18")
      const result = `${year} ${month} ${day} ${hours}:${minutes}`;
      return result;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (!isOpen || !completionRequest) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết yêu cầu hoàn thành chiến dịch</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="completion-request-details">
            <div className="campaign-info">
              <h3>Thông tin chiến dịch</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Tiêu đề:</strong>
                  <span>{completionRequest.title}</span>
                </div>
                <div className="info-item">
                  <strong>Thông báo:</strong>
                  <span>{completionRequest.message}</span>
                </div>
                <div className="info-item">
                  <strong>Thời gian yêu cầu:</strong>
                  <span>{completionRequest.time}</span>
                </div>
              </div>
            </div>

            {/* Only show statistics if message contains actual statistics */}
            {completionRequest.message.includes("đã tiêm") ||
            completionRequest.message.includes("hoãn tiêm") ||
            completionRequest.message.includes("chưa xác nhận") ? (
              <div className="campaign-statistics">
                <h3>Thống kê chiến dịch</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "total"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Tổng số học sinh</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "vaccinated"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Đã tiêm thành công</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "postponed"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Hoãn tiêm</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {extractStatFromMessage(
                        completionRequest.message,
                        "pending"
                      ) || "0"}
                    </div>
                    <div className="stat-label">Chưa xác nhận</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="campaign-statistics">
                <h3>Thông tin yêu cầu hoàn thành</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Chiến dịch:</strong>
                    <span>{extractCampaignName(completionRequest)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Người yêu cầu:</strong>
                    <span>{extractRequesterName(completionRequest)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Thời gian yêu cầu:</strong>
                    <span>{formatFullDateTime(completionRequest.date)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Trạng thái hiện tại:</strong>
                    <span>Đang chờ phê duyệt</span>
                  </div>
                </div>

                <div
                  className="completion-note"
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ color: "#389e0d", fontWeight: "500" }}>
                    <i
                      className="fas fa-info-circle"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Lưu ý quan trọng
                  </div>
                  <div style={{ marginTop: "8px", color: "#595959" }}>
                    Vui lòng kiểm tra kỹ thông tin chiến dịch, tình hình tiêm
                    chủng và các báo cáo liên quan trước khi phê duyệt yêu cầu
                    hoàn thành chiến dịch này.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {/* Show status message if request has been processed */}
          {isRequestProcessed && (
            <div
              style={{
                width: "100%",
                padding: "12px 20px",
                margin: "10px 0",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor:
                  completionRequest?.status === "APPROVED"
                    ? "#f6ffed"
                    : "#fff2f0",
                border:
                  completionRequest?.status === "APPROVED"
                    ? "1px solid #b7eb8f"
                    : "1px solid #ffccc7",
                color:
                  completionRequest?.status === "APPROVED"
                    ? "#52c41a"
                    : "#f5222d",
              }}
            >
              {statusMessage}
              {completionRequest?.reviewNotes && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    fontWeight: "normal",
                    color: "#666",
                  }}
                >
                  <strong>Ghi chú:</strong> {completionRequest.reviewNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCompletionRequestModal;
