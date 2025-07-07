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
      console.log(response);

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
    // Check if we have recommendations or notes to display
    if (result.recommendations) {
      return result.recommendations;
    }
    
    // If no specific details are available, return a generic message
    return result.resultNotes || "Bình thường";
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

  // Format detail key names to be more readable
  const formatDetailKey = (key) => {
    switch (key) {
      // Vision fields
      case 'visionLeft': return 'Mắt trái';
      case 'visionRight': return 'Mắt phải';
      case 'visionLeftWithGlass': return 'Mắt trái (với kính)';
      case 'visionRightWithGlass': return 'Mắt phải (với kính)';
      case 'needsGlasses': return 'Cần đeo kính';
      case 'visionDescription': return 'Mô tả thị lực';
      case 'eyeMovement': return 'Chuyển động mắt';
      case 'eyePressure': return 'Áp lực mắt';
      // Hearing fields
      case 'leftEar': return 'Tai trái';
      case 'rightEar': return 'Tai phải';
      case 'hearingAcuity': return 'Độ nhạy thính giác';
      case 'tympanometry': return 'Đo nhĩ lượng';
      case 'earWaxPresent': return 'Có ráy tai';
      case 'earInfection': return 'Nhiễm trùng tai';
      // Oral fields
      case 'teethCondition': return 'Tình trạng răng';
      case 'gumsCondition': return 'Tình trạng nướu';
      case 'tongueCondition': return 'Tình trạng lưỡi';
      case 'oralHygiene': return 'Vệ sinh răng miệng';
      case 'cavitiesCount': return 'Số răng sâu';
      case 'plaquePresent': return 'Có mảng bám';
      case 'gingivitis': return 'Viêm nướu';
      case 'mouthUlcers': return 'Loét miệng';
      // Skin fields
      case 'skinColor': return 'Màu da';
      case 'skinTone': return 'Tông da';
      case 'rashes': return 'Phát ban';
      case 'lesions': return 'Tổn thương';
      case 'dryness': return 'Khô da';
      case 'skinCondition': return 'Tình trạng da';
      case 'hasAllergies': return 'Có dị ứng';
      case 'eczema': return 'Chàm';
      case 'psoriasis': return 'Vẩy nến';
      case 'skinInfection': return 'Nhiễm trùng da';
      case 'allergies': return 'Dị ứng';
      case 'acne': return 'Mụn trứng cá';
      case 'scars': return 'Sẹo';
      case 'birthmarks': return 'Nốt ruồi/bớt';
      case 'treatment': return 'Điều trị';
      case 'followUpDate': return 'Ngày tái khám';
      // Respiratory fields
      case 'breathingRate': return 'Nhịp thở';
      case 'breathingSound': return 'Âm thở';
      case 'wheezing': return 'Thở khò khè';
      case 'cough': return 'Ho';
      case 'breathingDifficulty': return 'Khó thở';
      case 'oxygenSaturation': return 'Độ bão hòa oxy';
      case 'chestExpansion': return 'Độ giãn nở lồng ngực';
      case 'lungSounds': return 'Âm phổi';
      case 'asthmaHistory': return 'Tiền sử hen suyễn';
      case 'allergicRhinitis': return 'Viêm mũi dị ứng';
      // Common fields
      case 'doctorName': return 'Bác sĩ thực hiện';
      case 'dateOfExamination': return 'Ngày khám';
      case 'description': return 'Mô tả';
      case 'recommendations': return 'Khuyến nghị';
      case 'isAbnormal': return 'Bất thường';
      case 'id': return 'ID';
      default: return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    }
  };

  // Helper function to format JSON details
  const formatDetails = (details) => {
    if (!details || typeof details !== 'object') {
      return 'Không có thông tin chi tiết';
    }
    
    try {
      if (Array.isArray(details)) {
        return details.map((item, index) => (
          <div key={index} className="detail-item">
            {Object.entries(item).map(([key, value]) => (
              <div key={key}>
                <strong>{formatDetailKey(key)}:</strong> {formatValue(key, value)}
              </div>
            ))}
          </div>
        ));
      } else {
        return Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <strong>{formatDetailKey(key)}:</strong> {formatValue(key, value)}
          </div>
        ));
      }
    } catch (error) {
      console.error('Error formatting details:', error);
      return 'Lỗi hiển thị chi tiết';
    }
  };

  // Helper function to format values based on their type
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Format boolean values
    if (typeof value === 'boolean') {
      if (key.startsWith('is') || 
          key.includes('Present') || 
          key.includes('has') ||
          ['rashes', 'lesions', 'dryness', 'wheezing', 'cough', 
           'breathingDifficulty', 'needsGlasses', 'gingivitis', 
           'mouthUlcers', 'eczema', 'psoriasis', 'skinInfection',
           'allergies', 'acne', 'scars', 'birthmarks', 
           'asthmaHistory', 'allergicRhinitis'].includes(key)) {
        return value ? 'Có' : 'Không';
      }
    }
    
    // Format date values
    if (key.includes('Date') && typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
      try {
        return new Date(value).toLocaleDateString('vi-VN');
      } catch {
        return value;
      }
    }
    
    return value.toString();
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
                <span className="value">{selectedStudent.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Ngày tháng năm sinh:</span>
                <span className="value">{selectedStudent?.dateOfBirth ? formatDate(selectedStudent?.dateOfBirth) : "N/A"}</span>
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

            <div className="campaign-info-section">
              <h3>Thông Tin Chiến Dịch</h3>
              <div className="info-row">
                <span className="label">Tên chiến dịch:</span>
                <span className="value">{selectedResult.campaign.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Mô tả:</span>
                <span className="value">{selectedResult.campaign.description || "Không có mô tả"}</span>
              </div>
              <div className="info-row">
                <span className="label">Thời gian:</span>
                <span className="value">{formatDate(selectedResult.campaign.startDate)} - {formatDate(selectedResult.campaign.endDate)}</span>
              </div>
              <div className="info-row">
                <span className="label">Địa điểm:</span>
                <span className="value">{selectedResult.campaign.location || "Chưa có thông tin"}</span>
              </div>
            </div>

            <div className="health-metrics-section">
              <h3>Chỉ Số Sức Khỏe</h3>
              {selectedResult.overallResults?.height && (
                <div className="info-row">
                  <span className="label">Chiều cao:</span>
                  <span className="value">{selectedResult.overallResults.height} cm</span>
                  <span className="conclusion">Bình thường</span>
                </div>
              )}
              {selectedResult.overallResults?.weight && (
                <div className="info-row">
                  <span className="label">Cân nặng:</span>
                  <span className="value">{selectedResult.overallResults.weight} kg</span>
                  <span className="conclusion">Bình thường</span>
                </div>
              )}
              {selectedResult.overallResults?.bmi && (
                <div className="info-row">
                  <span className="label">BMI:</span>
                  <span className="value">{selectedResult.overallResults.bmi.toFixed(1)}</span>
                  <span className="conclusion">Bình thường</span>
                </div>
              )}
            </div>
            {console.log(selectedResult.categoryResults)}

            {selectedResult.categoryResults && Object.keys(selectedResult.categoryResults).length > 0 && (
              <div className="category-results-section">
                <h3>Kết Quả Khám Chi Tiết</h3>
                {Object.entries(selectedResult.categoryResults).map(([resultId, result]) => (
                  <div key={resultId} className="category-result">
                    <div className="info-row">
                      <span className="label">{getCategoryText(result.category)}:</span>
                      <span className="value">{getCategoryValue(result.category, result)}</span>
                      <span className={`conclusion ${getStatusClass(result.status)}`}>
                        {getStatusText(result.status)}
                      </span>
                    </div>
                    
                    {result.resultNotes && (
                      <div className="detail-row">
                        <span className="label">Ghi chú:</span>
                        <span className="value">{result.resultNotes}</span>
                      </div>
                    )}
                    
                    {result.recommendations && (
                      <div className="detail-row">
                        <span className="label">Khuyến nghị:</span>
                        <span className="value">{result.recommendations}</span>
                      </div>
                    )}

                    {/* Add any other specific fields that might be in the data */}
                    {result.performedAt && (
                      <div className="detail-row">
                        <span className="label">Ngày thực hiện:</span>
                        <span className="value">{formatDateTime(result.performedAt)}</span>
                      </div>
                    )}
                    
                    {result.nurseName && (
                      <div className="detail-row">
                        <span className="label">Y tá thực hiện:</span>
                        <span className="value">{result.nurseName}</span>
                      </div>
                    )}

                    {/* Display specific details based on category */}
                    {result.category === "VISION" && result.visionDetails && (
                      <div className="detail-row">
                        <span className="label">Chi tiết thị lực:</span>
                        <span className="value">
                          {formatDetails(result.visionDetails)}
                        </span>
                      </div>
                    )}

                    {result.category === "HEARING" && result.hearingDetails && (
                      <div className="detail-row">
                        <span className="label">Chi tiết thính lực:</span>
                        <span className="value">
                          {formatDetails(result.hearingDetails)}
                        </span>
                      </div>
                    )}

                    {result.category === "ORAL" && result.oralDetails && (
                      <div className="detail-row">
                        <span className="label">Chi tiết răng miệng:</span>
                        <span className="value">
                          {formatDetails(result.oralDetails)}
                        </span>
                      </div>
                    )}

                    {result.category === "SKIN" && result.skinDetails && (
                      <div className="detail-row">
                        <span className="label">Chi tiết da liễu:</span>
                        <span className="value">
                          {formatDetails(result.skinDetails)}
                        </span>
                      </div>
                    )}

                    {result.category === "RESPIRATORY" && result.respiratoryDetails && (
                      <div className="detail-row">
                        <span className="label">Chi tiết hô hấp:</span>
                        <span className="value">
                          {formatDetails(result.respiratoryDetails)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(!selectedResult.categoryResults || Object.keys(selectedResult.categoryResults).length === 0) && (
              <div className="no-detailed-results">
                <p>Chưa có kết quả chi tiết cho đợt khám này.</p>
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
                  {Object.entries(campaignResult.categoryResults).map(([resultId, result]) => (
                    <div key={resultId} className="result-card">
                      <div className="result-header">
                        <h4>{getCategoryText(result.category)}</h4>
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
                        {result.category === "VISION" && result.visionDetails && (
                          <div className="category-details">
                            <label>Chi tiết thị lực:</label>
                            <div className="details-content">
                              {formatDetails(result.visionDetails)}
                            </div>
                          </div>
                        )}

                        {result.category === "HEARING" && result.hearingDetails && (
                          <div className="category-details">
                            <label>Chi tiết thính lực:</label>
                            <div className="details-content">
                              {formatDetails(result.hearingDetails)}
                            </div>
                          </div>
                        )}

                        {result.category === "ORAL" && result.oralDetails && (
                          <div className="category-details">
                            <label>Chi tiết răng miệng:</label>
                            <div className="details-content">
                              {formatDetails(result.oralDetails)}
                            </div>
                          </div>
                        )}

                        {result.category === "SKIN" && result.skinDetails && (
                          <div className="category-details">
                            <label>Chi tiết da liễu:</label>
                            <div className="details-content">
                              {formatDetails(result.skinDetails)}
                            </div>
                          </div>
                        )}

                        {result.category === "RESPIRATORY" && result.respiratoryDetails && (
                          <div className="category-details">
                            <label>Chi tiết hô hấp:</label>
                            <div className="details-content">
                              {formatDetails(result.respiratoryDetails)}
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