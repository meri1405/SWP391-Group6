import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import "../../../styles/HealthCheckResults.css";

const HealthCheckResults = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [healthCheckResults, setHealthCheckResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "detail"
  const [selectedResult, setSelectedResult] = useState(null);
  const { getToken } = useAuth();

  const loadHealthCheckResults = useCallback(async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const response = await parentApi.getAllHealthCheckResultsForStudent(studentId, token);
      
      // Handle new response structure with campaignResults
      const campaignResults = response.campaignResults || [];
      setHealthCheckResults(campaignResults);
    } catch (error) {
      console.error("Error loading health check results:", error);
      setError("Không thể tải kết quả khám sức khỏe");
      setHealthCheckResults([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const studentsData = await parentApi.getMyStudents(token);
      setStudents(studentsData);
      
      // Auto-select first student if available
      if (studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
        await loadHealthCheckResults(studentsData[0].studentID);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setError("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  }, [getToken, loadHealthCheckResults]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleStudentChange = async (student) => {
    setSelectedStudent(student);
    if (student) {
      await loadHealthCheckResults(student.studentID);
    }
  };

  const handleViewDetails = (campaignResult) => {
    setSelectedResult(campaignResult);
    setViewMode("detail");
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setSelectedResult(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return new Date(dateTimeString).toLocaleString("vi-VN");
    } catch {
      return dateTimeString;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "NORMAL":
        return "Bình thường";
      case "ABNORMAL":
        return "Bất thường";
      case "REQUIRES_ATTENTION":
        return "Cần chú ý";
      default:
        return status || "Chưa có thông tin";
    }
  };

  const getCategoryValue = (category, result) => {
    switch (category) {
      case "VISION":
        return result.visionDetails ? "2 mắt 10/10" : "Chưa có thông tin";
      case "HEARING":
        return result.hearingDetails ? "Không viêm" : "Chưa có thông tin";
      case "ORAL":
        return result.oralDetails ? "Sâu 1 răng" : "Chưa có thông tin";
      case "SKIN":
        return result.skinDetails ? "Bình thường" : "Chưa có thông tin";
      case "RESPIRATORY":
        return result.respiratoryDetails ? "Bình thường" : "Chưa có thông tin";
      default:
        return "Chưa có thông tin";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "NORMAL":
        return "status-normal";
      case "ABNORMAL":
        return "status-abnormal";
      case "REQUIRES_ATTENTION":
        return "status-attention";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NORMAL":
        return "#52c41a";
      case "ABNORMAL":
        return "#f5222d";
      case "REQUIRES_ATTENTION":
        return "#faad14";
      default:
        return "#d9d9d9";
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case "VISION":
        return "Thị lực";
      case "HEARING":
        return "Thính lực";
      case "ORAL":
        return "Răng miệng";
      case "SKIN":
        return "Da liễu";
      case "RESPIRATORY":
        return "Hô hấp";
      case "GENERAL":
        return "Tổng quát";
      default:
        return category || "Khác";
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="health-check-results">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="health-check-results">
      <div className="health-check-results-header">
        
        {students.length > 1 && (
          <div className="student-selector">
            <label htmlFor="student-select">Chọn học sinh:</label>
            <select
              id="student-select"
              value={selectedStudent?.studentID || ""}
              onChange={(e) => {
                const student = students.find(s => s.studentID === parseInt(e.target.value));
                handleStudentChange(student);
              }}
            >
              {students.map((student) => (
                <option key={student.studentID} value={student.studentID}>
                  {student.firstName} {student.lastName} - {student.className}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={loadStudents} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {loading && selectedStudent && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải kết quả khám sức khỏe...</p>
        </div>
      )}

      {!loading && selectedStudent && healthCheckResults.length === 0 && (
        <div className="no-results">
          <i className="fas fa-clipboard-list"></i>
          <h3>Chưa có kết quả khám sức khỏe</h3>
          <p>Học sinh chưa có kết quả khám sức khỏe nào.</p>
        </div>
      )}

      {!loading && healthCheckResults.length > 0 && viewMode === "table" && (
        <div className="results-table-container">
          <div className="table-header">
            <h3>Kết Quả Khám Sức Khỏe</h3>
          </div>
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Chiến dịch</th>
                  <th>Ngày khám</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {healthCheckResults.map((campaignResult) => (
                  <tr key={campaignResult.campaign.id}>
                    <td>
                      <div className="campaign-info">
                        <strong>{campaignResult.campaign.name}</strong>
                        {campaignResult.campaign.description && (
                          <div className="campaign-desc">{campaignResult.campaign.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      {formatDate(campaignResult.campaign.startDate)} - {formatDate(campaignResult.campaign.endDate)}
                    </td>
                    <td>{campaignResult.campaign.location || "Chưa có thông tin"}</td>
                    <td>
                      <span className="status-indicator">
                        {campaignResult.hasResults ? "Đã có kết quả" : "Chưa có kết quả"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(campaignResult)}
                        disabled={!campaignResult.hasResults}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && healthCheckResults.length > 0 && viewMode === "detail" && selectedResult && (
        <div className="detail-view-container">
          <div className="detail-header">
            <button className="back-btn" onClick={handleBackToTable}>
              <i className="fas fa-arrow-left"></i> Quay lại danh sách
            </button>
            <h3>Chi Tiết Kết Quả Khám Sức Khỏe</h3>
          </div>
          
          <div className="health-check-report">
            <div className="report-header">
              <h2>KẾT QUẢ KHÁM SỨC KHỎE HỌC SINH</h2>
            </div>
            
            <div className="student-report-info">
              <div className="info-row">
                <span className="label">Họ tên:</span>
                <span className="value">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">Mã học sinh:</span>
                <span className="value">{selectedStudent.studentID}</span>
              </div>
              <div className="info-row">
                <span className="label">Lớp:</span>
                <span className="value">{selectedStudent.className}</span>
              </div>
              <div className="info-row">
                <span className="label">Ngày khám:</span>
                <span className="value">{formatDate(selectedResult.overallResults?.performedAt)}</span>
              </div>
            </div>

            {selectedResult.categoryResults && Object.keys(selectedResult.categoryResults).length > 0 && (
              <div className="examination-table">
                <table className="exam-results-table">
                  <thead>
                    <tr>
                      <th>Hạng mục</th>
                      <th>Giá trị</th>
                      <th>Kết luận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.overallResults?.height && (
                      <tr>
                        <td>Chiều cao</td>
                        <td>{selectedResult.overallResults.height} cm</td>
                        <td>Bình thường</td>
                      </tr>
                    )}
                    {selectedResult.overallResults?.weight && (
                      <tr>
                        <td>Cân nặng</td>
                        <td>{selectedResult.overallResults.weight} kg</td>
                        <td>Bình thường</td>
                      </tr>
                    )}
                    {Object.entries(selectedResult.categoryResults).map(([category, result]) => (
                      <tr key={category}>
                        <td>{getCategoryText(category)}</td>
                        <td>{getCategoryValue(category, result)}</td>
                        <td className={getStatusClass(result.status)}>
                          {getStatusText(result.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && healthCheckResults.length > 0 && viewMode === "cards" && (
        <div className="results-container">
          {healthCheckResults.map((campaignResult) => (
            <div key={campaignResult.campaign.id} className="campaign-result-card">
              <div className="campaign-header">
                <h3>{campaignResult.campaign.name}</h3>
                <div className="campaign-meta">
                  <span><i className="fas fa-calendar"></i> {formatDate(campaignResult.campaign.startDate)} - {formatDate(campaignResult.campaign.endDate)}</span>
                  {campaignResult.campaign.location && (
                    <span><i className="fas fa-map-marker-alt"></i> {campaignResult.campaign.location}</span>
                  )}
                </div>
              </div>

              {campaignResult.campaign.description && (
                <div className="campaign-description">
                  <p>{campaignResult.campaign.description}</p>
                </div>
              )}

              {/* Overall measurements section */}
              {campaignResult.overallResults && Object.keys(campaignResult.overallResults).length > 0 && (
                <div className="overall-measurements">
                  <h4>Chỉ số tổng quát</h4>
                  <div className="measurements-grid">
                    {campaignResult.overallResults.height && (
                      <div className="measurement-item">
                        <label>Chiều cao:</label>
                        <span>{campaignResult.overallResults.height} cm</span>
                      </div>
                    )}
                    {campaignResult.overallResults.weight && (
                      <div className="measurement-item">
                        <label>Cân nặng:</label>
                        <span>{campaignResult.overallResults.weight} kg</span>
                      </div>
                    )}
                    {campaignResult.overallResults.bmi && (
                      <div className="measurement-item">
                        <label>BMI:</label>
                        <span>{campaignResult.overallResults.bmi.toFixed(1)}</span>
                      </div>
                    )}
                    {campaignResult.overallResults.performedAt && (
                      <div className="measurement-item">
                        <label>Ngày khám:</label>
                        <span>{formatDateTime(campaignResult.overallResults.performedAt)}</span>
                      </div>
                    )}
                    {campaignResult.overallResults.nurseName && (
                      <div className="measurement-item">
                        <label>Y tá thực hiện:</label>
                        <span>{campaignResult.overallResults.nurseName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category results section */}
              {campaignResult.categoryResults && Object.keys(campaignResult.categoryResults).length > 0 && (
                <div className="results-grid">
                  {Object.entries(campaignResult.categoryResults).map(([category, result]) => (
                    <div key={category} className="result-card">
                      <div className="result-header">
                        <h4>{getCategoryText(category)}</h4>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(result.status) }}
                        >
                          {getStatusText(result.status)}
                        </span>
                      </div>

                      <div className="result-details">
                        {result.resultNotes && (
                          <div className="result-notes">
                            <label>Ghi chú:</label>
                            <p>{result.resultNotes}</p>
                          </div>
                        )}

                        {result.recommendations && (
                          <div className="recommendations">
                            <label>Khuyến nghị:</label>
                            <p>{result.recommendations}</p>
                          </div>
                        )}

                        {/* Category-specific details */}
                        {result.visionDetails && (
                          <div className="category-details">
                            <label>Chi tiết thị lực:</label>
                            <div className="details-content">
                              {result.visionDetails.map((detail, index) => (
                                <div key={index} className="detail-item">
                                  <span>Mắt trái: {detail.visionLeft || 'N/A'}</span>
                                  <span>Mắt phải: {detail.visionRight || 'N/A'}</span>
                                  {detail.needsGlasses && <span className="needs-glasses">Cần đeo kính</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.hearingDetails && (
                          <div className="category-details">
                            <label>Chi tiết thính lực:</label>
                            <div className="details-content">
                              {result.hearingDetails.map((detail, index) => (
                                <div key={index} className="detail-item">
                                  <span>Tai trái: {detail.leftEar || 'N/A'}</span>
                                  <span>Tai phải: {detail.rightEar || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.oralDetails && (
                          <div className="category-details">
                            <label>Chi tiết răng miệng:</label>
                            <div className="details-content">
                              {result.oralDetails.map((detail, index) => (
                                <div key={index} className="detail-item">
                                  <span>Tình trạng răng: {detail.teethCondition || 'N/A'}</span>
                                  <span>Tình trạng nướu: {detail.gumsCondition || 'N/A'}</span>
                                  {detail.cavitiesCount > 0 && <span>Số răng sâu: {detail.cavitiesCount}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.skinDetails && (
                          <div className="category-details">
                            <label>Chi tiết da liễu:</label>
                            <div className="details-content">
                              {result.skinDetails.map((detail, index) => (
                                <div key={index} className="detail-item">
                                  <span>Tình trạng da: {detail.skinCondition || 'N/A'}</span>
                                  {detail.hasAllergies && <span className="has-allergies">Có dị ứng</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.respiratoryDetails && (
                          <div className="category-details">
                            <label>Chi tiết hô hấp:</label>
                            <div className="details-content">
                              {result.respiratoryDetails.map((detail, index) => (
                                <div key={index} className="detail-item">
                                  <span>Nhịp thở: {detail.breathingRate || 'N/A'}</span>
                                  <span>Tình trạng phổi: {detail.lungCondition || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="result-meta">
                          <span><i className="fas fa-clock"></i> {formatDateTime(result.performedAt)}</span>
                          {result.nurseName && (
                            <span><i className="fas fa-user-md"></i> Y tá: {result.nurseName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!campaignResult.categoryResults || Object.keys(campaignResult.categoryResults).length === 0) && (
                <div className="no-category-results">
                  <p>Chưa có kết quả chi tiết cho đợt khám này.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthCheckResults;