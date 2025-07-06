import React, { useState, useEffect } from "react";
import { parentApi } from "../../../api/parentApi";
import "../../../styles/VaccinationSchedule.css";

const VaccinationSchedule = () => {
  const [activeTab, setActiveTab] = useState("completed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);

  // Load vaccination data on component mount
  useEffect(() => {
    loadVaccinationData();
  }, []);

  const loadVaccinationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all students and their health profiles
      const students = await parentApi.getMyStudents();
      console.log("Students data:", students);
      console.log("First student structure:", students[0]);
      
      let allCompletedVaccinations = [];
      let allUpcomingVaccinations = [];

      // For each student, get their health profile to extract vaccination history
      for (const student of students) {
        try {
          console.log("Processing student:", student);
          // Get health profile for this student
          const healthProfileData = await parentApi.getHealthProfilesByStudentId(student.id);
          console.log(`Health profile for student ${student.fullName}:`, healthProfileData);
          
          if (healthProfileData && healthProfileData.length > 0) {
            // Get the first (active) health profile
            const healthProfile = healthProfileData[0];
            
            // Extract vaccination history
            if (healthProfile.vaccinationHistory && healthProfile.vaccinationHistory.length > 0) {
              const studentVaccinations = healthProfile.vaccinationHistory.map(vaccination => ({
                id: `${student.id}-${vaccination.id}`,
                vaccine: `${vaccination.vaccineName}${vaccination.doseNumber ? ` (lần ${vaccination.doseNumber})` : ''}`,
                date: vaccination.dateOfVaccination,
                location: vaccination.placeOfVaccination,
                batchNumber: vaccination.manufacturer || '--',
                nextDue: null,
                status: "completed",
                studentName: student.fullName,
                studentClassName: student.className || '--',
                notes: vaccination.notes
              }));
              allCompletedVaccinations.push(...studentVaccinations);
            }
          }
        } catch (profileError) {
          console.error(`Error loading health profile for student ${student.fullName}:`, profileError);
        }
      }

      // Load upcoming vaccinations from vaccination forms
      try {
        const vaccinationForms = await parentApi.getVaccinationForms();
        console.log("Vaccination forms:", vaccinationForms);
        
        // Filter for confirmed forms that are scheduled in the future
        const confirmedForms = vaccinationForms.filter(form => 
          form.confirmationStatus === 'CONFIRMED' && 
          new Date(form.scheduledDate) > new Date()
        );
        
        const upcomingData = confirmedForms.map(form => ({
          id: form.id,
          vaccine: `${form.vaccineName}${form.doseNumber ? ` (lần ${form.doseNumber})` : ''}`,
          scheduledDate: form.scheduledDate,
          location: form.location,
          status: "scheduled",
          priority: "medium",
          studentName: form.studentFullName,
          studentClassName: form.studentClassName || '--',
          campaignName: form.campaignName,
          formId: form.id
        }));
        
        allUpcomingVaccinations = upcomingData;
      } catch (formsError) {
        console.error("Error loading vaccination forms:", formsError);
      }

      console.log("Final completed vaccinations:", allCompletedVaccinations);
      console.log("Final upcoming vaccinations:", allUpcomingVaccinations);
      
      setCompletedVaccinations(allCompletedVaccinations);
      setUpcomingVaccinations(allUpcomingVaccinations);
    } catch (error) {
      console.error("Error loading vaccination data:", error);
      setError("Không thể tải dữ liệu lịch tiêm chủng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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
          <button className="retry-btn" onClick={loadVaccinationData}>
            <i className="fas fa-refresh"></i>
            Thử lại
          </button>
        </div>
      ) : (
        <>
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
