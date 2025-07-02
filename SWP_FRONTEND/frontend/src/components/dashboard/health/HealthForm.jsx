import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import "../../../styles/VaccinationFormModal.css";

const HealthCheckFormModal = ({
  isOpen,
  onClose,
  healthCheckFormId,
  onFormUpdated,
}) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'confirm' or 'decline'
  const { getToken } = useAuth();

  const loadHealthCheckForm = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    if (!healthCheckFormId) {
      console.log("No healthCheckFormId provided");
      return;
    }

    console.log("Loading health check form with ID:", healthCheckFormId);

    try {
      setLoading(true);
      setError(null);
      const formData = await parentApi.getHealthCheckFormById(
        healthCheckFormId,
        token
      );
      console.log("Received form data:", formData);
      setForm(formData);
    } catch (error) {
      console.error("Error loading health check form:", error);
      setError("Không thể tải thông tin phiếu khám sức khỏe");
    } finally {
      setLoading(false);
    }
  }, [getToken, healthCheckFormId]);

  useEffect(() => {
    if (isOpen && healthCheckFormId) {
      loadHealthCheckForm();
    }
  }, [isOpen, healthCheckFormId, loadHealthCheckForm]);

  const handleConfirmClick = () => {
    setConfirmAction("confirm");
    setShowConfirmDialog(true);
  };

  const handleDeclineClick = () => {
    setConfirmAction("decline");
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setSubmitting(true);
      setError(null);
      let response;

      console.log('Submitting form with action:', confirmAction, 'and notes:', notes);

      if (confirmAction === "confirm") {
        response = await parentApi.confirmHealthCheckForm(
          healthCheckFormId,
          notes,
          token
        );
      } else {
        response = await parentApi.declineHealthCheckForm(
          healthCheckFormId,
          notes,
          token
        );
      }

      console.log('Form submission response:', response);

      // Handle both possible response formats
      const formData = response?.form || response;
      
      if (formData && (formData.id || formData.form?.id)) {
        // Update form state with the correct data structure
        const updatedForm = formData.form || formData;
        setForm(updatedForm);
        
        // Then close dialog and clear notes
        setShowConfirmDialog(false);
        setNotes("");
        
        // Finally notify parent component
        if (onFormUpdated) {
          onFormUpdated(updatedForm);
        }
      } else {
        console.error('Invalid response format:', response);
        setError("Không thể xử lý yêu cầu - phản hồi không hợp lệ");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "Không thể xử lý yêu cầu. Vui lòng thử lại.";
      
      // Extract error message from response if available
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Không hợp lệ";
      
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return "Không hợp lệ";
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";

    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return "Không hợp lệ";
      
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return "Không hợp lệ";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "#52c41a";
      case "DECLINED":
        return "#ff4d4f";
      case "PENDING":
        return "#faad14";
      case "EXPIRED":
        return "#8c8c8c";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "DECLINED":
        return "Đã từ chối";
      case "PENDING":
        return "Chờ xác nhận";
      case "EXPIRED":
        return "Đã hết hạn";
      default:
        return status;
    }
  };

  const getHealthCheckTypeText = (type) => {
    switch (type) {
      case "VISION":
        return "Khám mắt";
      case "HEARING":
        return "Khám tai mũi họng";
      case "ORAL":
        return "Khám răng miệng";
      case "SKIN":
        return "Khám da liễu";
      case "RESPIRATORY":
        return "Khám hô hấp";
      default:
        return type || "Không xác định";
    }
  };


  if (!isOpen) return null;

  return (
    <div className="vaccination-form-modal-overlay">
      <div className="vaccination-form-modal">
        <div className="vaccination-form-modal-header">
          <h2>Chi tiết phiếu đăng ký khám sức khỏe</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="vaccination-form-modal-body">
          {loading && (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải thông tin...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          )}

          {form && (
            <div className="form-details">
              {console.log("Form data for rendering:", form)}
              <div className="form-header">
                <div className="student-info">
                  <h3>{form.studentFirstName} {form.studentLastName}</h3>
                  <div className="student-details">
                    {form.studentDob && (
                      <p>
                        <i className="fas fa-birthday-cake"></i> Ngày sinh:{" "}
                        {formatDate(form.studentDob)}
                      </p>
                    )}
                    {form.studentGender && (
                      <p>
                        <i className="fas fa-user"></i> Giới tính:{" "}
                        {form.studentGender === 'M' ? 'Nam' : form.studentGender === 'F' ? 'Nữ' : form.studentGender}
                      </p>
                    )}
                    {form.studentClassName && (
                      <p>
                        <i className="fas fa-graduation-cap"></i> Lớp:{" "}
                        {form.studentClassName}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(form.status),
                  }}
                >
                  {getStatusText(form.status)}
                </div>
              </div>
              <div className="form-content">
                <div className="info-section">
                  <h4>Thông tin khám sức khỏe</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Loại khám:</label>
                      <span>
                        {form.campaignCategories && form.campaignCategories.length > 0 
                          ? form.campaignCategories.map(cat => getHealthCheckTypeText(cat)).join(', ')
                          : 'Chưa có thông tin'
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Địa điểm chiến dịch:</label>
                      <span>{form.campaignLocation || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label>Thời gian hẹn:</label>
                      <span>{formatDateTime(form.appointmentTime)}</span>
                    </div>
                    <div className="info-item">
                      <label>Địa điểm khám:</label>
                      <span>{form.appointmentLocation || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày gửi phiếu:</label>
                      <span>{formatDateTime(form.sentAt)}</span>
                    </div>
                    {form.checkedIn && (
                      <div className="info-item">
                        <label>Đã check-in:</label>
                        <span style={{color: '#52c41a'}}>
                          <i className="fas fa-check-circle"></i> Đã check-in 
                          {form.checkedInAt && ` lúc ${formatDateTime(form.checkedInAt)}`}
                        </span>
                      </div>
                    )}
                    {form.reminderSent && (
                      <div className="info-item">
                        <label>Nhắc nhở:</label>
                        <span style={{color: '#1890ff'}}>
                          <i className="fas fa-bell"></i> Đã gửi nhắc nhở
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {form.campaignDescription && (
                  <div className="info-section">
                    <h4>Mô tả chiến dịch</h4>
                    <div className="campaign-description">
                      {form.campaignDescription
                        .split("\n")
                        .map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="info-section">
                  <h4>Thông tin chiến dịch</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Tên chiến dịch:</label>
                      <span>{form.campaignName || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày bắt đầu:</label>
                      <span>{formatDate(form.campaignStartDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày kết thúc:</label>
                      <span>{formatDate(form.campaignEndDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>Tạo bởi:</label>
                      <span>{form.campaignCreatedBy || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày tạo:</label>
                      <span>{formatDateTime(form.campaignCreatedAt)}</span>
                    </div>
                    <div className="info-item">
                      <label>Phê duyệt bởi:</label>
                      <span>{form.campaignApprovedBy || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày phê duyệt:</label>
                      <span>{formatDateTime(form.campaignApprovedAt)}</span>
                    </div>
                    {form.campaignNotes && (
                      <div className="info-item full-width">
                        <label>Ghi chú chiến dịch:</label>
                        <div>{form.campaignNotes}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <h4>Thông tin phụ huynh</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Họ tên:</label>
                      <span>
                        {form.parentFirstName && form.parentLastName 
                          ? `${form.parentFirstName} ${form.parentLastName}`
                          : 'Chưa có thông tin'
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại:</label>
                      <span>{form.parentPhone || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{form.parentEmail || 'Chưa có thông tin'}</span>
                    </div>
                  </div>
                </div>

                {form.respondedAt && (
                  <div className="info-section">
                    <h4>Thông tin phản hồi</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Ngày phản hồi:</label>
                        <span>{formatDateTime(form.respondedAt)}</span>
                      </div>
                      {form.parentNote && (
                        <div className="info-item full-width">
                          <label>Ghi chú của phụ huynh:</label>
                          <div style={{marginTop: '8px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>
                            {form.parentNote.split("\n").map((line, index) => (
                              <div key={index}>{line}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {form.status === "PENDING" && (
                <div className="form-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleConfirmClick}
                  >
                    <i className="fas fa-check"></i>
                    Đồng ý khám sức khỏe
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeclineClick}
                  >
                    <i className="fas fa-times"></i>
                    Từ chối khám sức khỏe
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <div className="confirm-dialog-header">
                <h3>
                  {confirmAction === "confirm"
                    ? "Xác nhận đồng ý"
                    : "Xác nhận từ chối"}
                </h3>
              </div>
              <div className="confirm-dialog-body">
                <p>
                  {confirmAction === "confirm"
                    ? `Bạn có chắc chắn muốn đồng ý cho con tham gia chiến dịch khám sức khỏe "${form?.campaignName}"?`
                    : `Bạn có chắc chắn muốn từ chối cho con tham gia chiến dịch khám sức khỏe "${form?.campaignName}"?`}
                </p>
                <div className="notes-section">
                  <label>
                    Ghi chú{" "}
                    {confirmAction === "decline" ? "(bắt buộc)" : "(tùy chọn)"}:
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      confirmAction === "confirm"
                        ? "Ghi chú thêm (nếu có)..."
                        : "Vui lòng ghi rõ lý do từ chối..."
                    }
                    rows={3}
                    required={confirmAction === "decline"}
                  />
                </div>
              </div>
              <div className="confirm-dialog-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setNotes("");
                  }}
                >
                  Hủy
                </button>
                <button
                  className={`btn ${
                    confirmAction === "confirm" ? "btn-success" : "btn-danger"
                  }`}
                  onClick={handleConfirmSubmit}
                  disabled={
                    submitting || (confirmAction === "decline" && !notes.trim())
                  }
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : confirmAction === "confirm" ? (
                    "Xác nhận đồng ý"
                  ) : (
                    "Xác nhận từ chối"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCheckFormModal;
