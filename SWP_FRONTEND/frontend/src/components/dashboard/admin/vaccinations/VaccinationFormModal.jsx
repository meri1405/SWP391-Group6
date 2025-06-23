import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { parentApi } from "../../../../api/parentApi";
import "../../../../styles/VaccinationFormModal.css";

const VaccinationFormModal = ({
  isOpen,
  onClose,
  vaccinationFormId,
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

  const formatGender = (gender) => {
    if (!gender) return "Không có thông tin";

    switch (gender.toLowerCase()) {
      case "male":
      case "nam":
        return "Nam";
      case "female":
      case "nữ":
        return "Nữ";
      default:
        return gender;
    }
  };

  const loadVaccinationForm = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await parentApi.getVaccinationFormById(
        vaccinationFormId,
        token
      );
      if (response.success) {
        setForm(response.form);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Error loading vaccination form:", error);
      setError("Không thể tải thông tin phiếu tiêm chủng");
    } finally {
      setLoading(false);
    }
  }, [getToken, vaccinationFormId]);

  useEffect(() => {
    if (isOpen && vaccinationFormId) {
      loadVaccinationForm();
    }
  }, [isOpen, vaccinationFormId, loadVaccinationForm]);

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
      let response;

      if (confirmAction === "confirm") {
        response = await parentApi.confirmVaccinationForm(
          vaccinationFormId,
          notes,
          token
        );
      } else {
        response = await parentApi.declineVaccinationForm(
          vaccinationFormId,
          notes,
          token
        );
      }

      if (response.success) {
        setForm(response.form);
        setShowConfirmDialog(false);
        setNotes("");
        if (onFormUpdated) {
          onFormUpdated(response.form);
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Không thể xử lý yêu cầu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
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

  if (!isOpen) return null;

  return (
    <div className="vaccination-form-modal-overlay">
      <div className="vaccination-form-modal">
        <div className="vaccination-form-modal-header">
          <h2>Chi tiết phiếu tiêm chủng</h2>
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
              {" "}
              <div className="form-header">
                <div className="student-info">
                  <h3>{form.studentFullName}</h3>
                  <div className="student-details">
                    {form.studentDateOfBirth && (
                      <p>
                        <i className="fas fa-birthday-cake"></i> Ngày sinh:{" "}
                        {formatDate(form.studentDateOfBirth)}
                      </p>
                    )}
                    {form.studentGender && (
                      <p>
                        <i className="fas fa-user"></i> Giới tính:{" "}
                        {formatGender(form.studentGender)}
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
                    backgroundColor: getStatusColor(form.confirmationStatus),
                  }}
                >
                  {getStatusText(form.confirmationStatus)}
                </div>
              </div>
              <div className="form-content">
                <div className="info-section">
                  <h4>Thông tin vắc xin</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Tên vắc xin:</label>
                      <span>{form.vaccineName}</span>
                    </div>
                    {form.vaccineBrand && (
                      <div className="info-item">
                        <label>Thương hiệu:</label>
                        <span>{form.vaccineBrand}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Liều số:</label>
                      <span>{form.doseNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày dự kiến:</label>
                      <span>{formatDate(form.scheduledDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>Địa điểm:</label> <span>{form.location}</span>
                    </div>
                  </div>
                </div>

                {form.prePostCareInstructions && (
                  <div className="info-section">
                    <h4>Hướng dẫn chăm sóc trước/sau tiêm</h4>
                    <div className="care-instructions">
                      {form.prePostCareInstructions
                        .split("\n")
                        .map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                    </div>
                  </div>
                )}

                {form.additionalInfo && (
                  <div className="info-section">
                    <h4>Thông tin bổ sung</h4>
                    <div className="additional-info">
                      {form.additionalInfo.split("\n").map((line, index) => (
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
                      <span>{form.campaignName}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày tạo:</label>
                      <span>{formatDate(form.createdDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>Người tạo:</label>
                      <span>{form.createdByName}</span>
                    </div>
                  </div>
                </div>

                {form.confirmationDate && (
                  <div className="info-section">
                    <h4>Thông tin xác nhận</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Ngày xác nhận:</label>
                        <span>{formatDate(form.confirmationDate)}</span>
                      </div>{" "}
                      {form.parentNotes && (
                        <div className="info-item full-width">
                          <label>Ghi chú của phụ huynh:</label>
                          {form.parentNotes.split("\n").map((line, index) => (
                            <div key={index}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {form.confirmationStatus === "PENDING" && (
                <div className="form-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleConfirmClick}
                  >
                    <i className="fas fa-check"></i>
                    Đồng ý tiêm chủng
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeclineClick}
                  >
                    <i className="fas fa-times"></i>
                    Từ chối tiêm chủng
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
                    ? `Bạn có chắc chắn muốn đồng ý cho con tiêm vắc xin ${form?.vaccineName}?`
                    : `Bạn có chắc chắn muốn từ chối cho con tiêm vắc xin ${form?.vaccineName}?`}
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

// export { VaccinationFormModal };
export default VaccinationFormModal;
