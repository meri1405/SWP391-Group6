import React from "react";
import { useVaccinationSchedule } from "../../../hooks/useVaccinationSchedule";
import { formatDate, getPriorityColor, getPriorityText } from "../../../utils/vaccinationUtils";
import "../../../styles/VaccinationSchedule.css";

const VaccinationSchedule = () => {
  const {
    activeTab,
    loading,
    error,
    completedVaccinations,
    upcomingVaccinations,
    handleTabSwitch,
    retryLoadingData,
    completedCount,
    upcomingCount
  } = useVaccinationSchedule();

  return (
    <div className="vaccination-container">
      <div className="vaccination-header">
        <h2>Lịch Tiêm Chủng</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="retry-btn" onClick={retryLoadingData}>
            <i className="fas fa-refresh"></i>
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => handleTabSwitch("completed")}
            >
              <i className="fas fa-check-circle"></i>
              Đã tiêm ({completedCount})
            </button>
            <button
              className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => handleTabSwitch("upcoming")}
            >
              <i className="fas fa-calendar-alt"></i>
              Sắp tới ({upcomingCount})
            </button>
          </div>

          {activeTab === "completed" && (
            <div className="tab-content">
              {completedVaccinations.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-syringe"></i>
                  <p>Chưa có lịch sử tiêm chủng nào</p>
                </div>
              ) : (
                <div className="vaccination-list">
                  {completedVaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="vaccination-card completed">
                      <div className="card-header">
                        <h3>{vaccination.vaccine}</h3>
                        <span className="status-badge completed">
                          <i className="fas fa-check"></i>
                          Đã tiêm
                        </span>
                      </div>
                      <div className="card-body">
                        {vaccination.studentName && (
                          <div className="info-row">
                            <span className="label">
                              <i className="fas fa-user"></i>
                              Học sinh:
                            </span>
                            <span className="value">
                              {vaccination.studentName} - Lớp {vaccination.studentClassName}
                            </span>
                          </div>
                        )}
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-calendar"></i>
                            Ngày tiêm:
                          </span>
                          <span className="value">
                            {formatDate(vaccination.date)}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-map-marker-alt"></i>
                            Địa điểm:
                          </span>
                          <span className="value">{vaccination.location}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-barcode"></i>
                            Số lô:
                          </span>
                          <span className="value">{vaccination.batchNumber}</span>
                        </div>
                        {vaccination.notes && (
                          <div className="info-row">
                            <span className="label">
                              <i className="fas fa-sticky-note"></i>
                              Ghi chú:
                            </span>
                            <span className="value">{vaccination.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "upcoming" && (
            <div className="tab-content">
              {upcomingVaccinations.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-plus"></i>
                  <p>Không có lịch tiêm sắp tới</p>
                </div>
              ) : (
                <div className="vaccination-list">
                  {upcomingVaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="vaccination-card upcoming">
                      <div className="card-header">
                        <h3>{vaccination.vaccine}</h3>
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: getPriorityColor(vaccination.priority),
                            color: "white",
                          }}
                        >
                          {getPriorityText(vaccination.priority)}
                        </span>
                      </div>
                      <div className="card-body">
                        {vaccination.studentName && (
                          <div className="info-row">
                            <span className="label">
                              <i className="fas fa-user"></i>
                              Học sinh:
                            </span>
                            <span className="value">
                              {vaccination.studentName} - Lớp {vaccination.studentClassName}
                            </span>
                          </div>
                        )}
                        {vaccination.campaignName && (
                          <div className="info-row">
                            <span className="label">
                              <i className="fas fa-flag"></i>
                              Chiến dịch:
                            </span>
                            <span className="value">{vaccination.campaignName}</span>
                          </div>
                        )}
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-calendar"></i>
                            Ngày dự kiến:
                          </span>
                          <span className="value">
                            {formatDate(vaccination.scheduledDate)}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">
                            <i className="fas fa-map-marker-alt"></i>
                            Địa điểm:
                          </span>
                          <span className="value">{vaccination.location}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="info-btn">
                          <i className="fas fa-info-circle"></i>
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaccinationSchedule;
