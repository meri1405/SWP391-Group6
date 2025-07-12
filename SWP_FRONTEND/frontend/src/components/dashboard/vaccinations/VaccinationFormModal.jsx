import React from "react";
import { useVaccinationFormModal } from "../../../hooks/useVaccinationFormModal";
import {
  formatGender,
  getStatusColor,
  getStatusText,
  validateFormSubmission,
  getConfirmationDialogTitle,
  getConfirmationDialogMessage,
  getNotesPlaceholder,
  getNotesLabel,
  canModifyForm
} from "../../../utils/vaccinationFormModalUtils";
import { formatDate } from "../../../utils/timeUtils";
import "../../../styles/VaccinationFormModal.css";

const VaccinationFormModal = ({
  isOpen,
  onClose,
  vaccinationFormId,
  onFormUpdated,
}) => {
  const {
    form,
    loading,
    submitting,
    error,
    notes,
    showConfirmDialog,
    confirmAction,
    handleConfirmClick,
    handleDeclineClick,
    handleConfirmSubmit,
    handleCancelConfirmation,
    handleNotesChange,
  } = useVaccinationFormModal(vaccinationFormId, isOpen, onFormUpdated);

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
              {canModifyForm(form.confirmationStatus) && (
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
                <h3>{getConfirmationDialogTitle(confirmAction)}</h3>
              </div>
              <div className="confirm-dialog-body">
                <p>{getConfirmationDialogMessage(confirmAction, form?.vaccineName)}</p>
                <div className="notes-section">
                  <label>{getNotesLabel(confirmAction)}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder={getNotesPlaceholder(confirmAction)}
                    rows={3}
                    required={confirmAction === "decline"}
                  />
                </div>
              </div>
              <div className="confirm-dialog-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelConfirmation}
                >
                  Hủy
                </button>
                <button
                  className={`btn ${
                    confirmAction === "confirm" ? "btn-success" : "btn-danger"
                  }`}
                  onClick={handleConfirmSubmit}
                  disabled={
                    submitting || !validateFormSubmission(confirmAction, notes)
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
