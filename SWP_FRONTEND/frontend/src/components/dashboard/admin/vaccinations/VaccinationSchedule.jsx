import React, { useState } from "react";
import "../../../../styles/VaccinationSchedule.css";

const VaccinationSchedule = () => {
  const [activeTab, setActiveTab] = useState("completed");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVaccination, setNewVaccination] = useState({
    vaccine: "",
    date: "",
    location: "",
    batchNumber: "",
    nextDue: "",
    notes: "",
  });

  // Mock data for completed vaccinations
  const [completedVaccinations] = useState([
    {
      id: 1,
      vaccine: "Viêm gan B (lần 1)",
      date: "2023-03-15",
      location: "Trung tâm Y tế Quận 1",
      batchNumber: "HB2023-001",
      nextDue: "2023-04-15",
      status: "completed",
    },
    {
      id: 2,
      vaccine: "DPT (lần 1)",
      date: "2023-04-20",
      location: "Bệnh viện Nhi Đồng",
      batchNumber: "DPT2023-045",
      nextDue: "2023-06-20",
      status: "completed",
    },
    {
      id: 3,
      vaccine: "MMR (Sởi - Quai bị - Rubella)",
      date: "2023-05-10",
      location: "Trung tâm Y tế Quận 3",
      batchNumber: "MMR2023-078",
      nextDue: null,
      status: "completed",
    },
  ]);

  // Mock data for upcoming vaccinations
  const [upcomingVaccinations] = useState([
    {
      id: 4,
      vaccine: "Viêm gan B (lần 2)",
      scheduledDate: "2024-01-15",
      location: "Trung tâm Y tế Quận 1",
      status: "scheduled",
      priority: "high",
    },
    {
      id: 5,
      vaccine: "DPT (lần 2)",
      scheduledDate: "2024-02-20",
      location: "Bệnh viện Nhi Đồng",
      status: "scheduled",
      priority: "medium",
    },
    {
      id: 6,
      vaccine: "Polio (lần 1)",
      scheduledDate: "2024-03-10",
      location: "Trung tâm Y tế Quận 3",
      status: "scheduled",
      priority: "medium",
    },
  ]);

  const handleAddVaccination = () => {
    // API call to add vaccination record
    console.log("Adding vaccination:", newVaccination);
    setShowAddModal(false);
    setNewVaccination({
      vaccine: "",
      date: "",
      location: "",
      batchNumber: "",
      nextDue: "",
      notes: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "";
    }
  };

  return (
    <div className="vaccination-container">
      <div className="vaccination-header">
        <h2>Lịch Tiêm Chủng</h2>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i>
          Thêm mới
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          <i className="fas fa-check-circle"></i>
          Đã tiêm ({completedVaccinations.length})
        </button>
        <button
          className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          <i className="fas fa-calendar-alt"></i>
          Sắp tới ({upcomingVaccinations.length})
        </button>
      </div>

      {activeTab === "completed" && (
        <div className="tab-content">
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
                  {vaccination.nextDue && (
                    <div className="info-row">
                      <span className="label">
                        <i className="fas fa-clock"></i>
                        Tiêm tiếp theo:
                      </span>
                      <span className="value">
                        {formatDate(vaccination.nextDue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "upcoming" && (
        <div className="tab-content">
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
                  <button className="confirm-btn">
                    <i className="fas fa-check"></i>
                    Xác nhận đặt lịch
                  </button>
                  <button className="reschedule-btn">
                    <i className="fas fa-calendar-alt"></i>
                    Dời lịch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Vaccination Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thêm thông tin tiêm chủng</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên vaccine</label>
                <input
                  type="text"
                  value={newVaccination.vaccine}
                  onChange={(e) =>
                    setNewVaccination((prev) => ({
                      ...prev,
                      vaccine: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên vaccine"
                />
              </div>
              <div className="form-group">
                <label>Ngày tiêm</label>
                <input
                  type="date"
                  value={newVaccination.date}
                  onChange={(e) =>
                    setNewVaccination((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Địa điểm tiêm</label>
                <input
                  type="text"
                  value={newVaccination.location}
                  onChange={(e) =>
                    setNewVaccination((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Nhập địa điểm tiêm"
                />
              </div>
              <div className="form-group">
                <label>Số lô vaccine</label>
                <input
                  type="text"
                  value={newVaccination.batchNumber}
                  onChange={(e) =>
                    setNewVaccination((prev) => ({
                      ...prev,
                      batchNumber: e.target.value,
                    }))
                  }
                  placeholder="Nhập số lô"
                />
              </div>
              <div className="form-group">
                <label>Ngày tiêm tiếp theo (nếu có)</label>
                <input
                  type="date"
                  value={newVaccination.nextDue}
                  onChange={(e) =>
                    setNewVaccination((prev) => ({
                      ...prev,
                      nextDue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={newVaccination.notes}
                  onChange={(e) =>
                    setNewVaccination((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Nhập ghi chú (nếu có)"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button className="save-btn" onClick={handleAddVaccination}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationSchedule;
