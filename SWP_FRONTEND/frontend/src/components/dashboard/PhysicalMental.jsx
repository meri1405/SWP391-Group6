import React, { useState, useEffect } from 'react';
import '../../styles/PhysicalMental.css';

const PhysicalMental = () => {
  const [activeTab, setActiveTab] = useState('physical');
  const [physicalData, setPhysicalData] = useState({
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    heartRate: '',
    vision: '',
    fitness: ''
  });
  const [mentalData, setMentalData] = useState({
    mood: '',
    stress: '',
    sleep: '',
    anxiety: '',
    concentration: '',
    notes: ''
  });
  const [editMode, setEditMode] = useState(false);

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (physicalData.height && physicalData.weight) {
      const heightInM = physicalData.height / 100;
      const bmi = (physicalData.weight / (heightInM * heightInM)).toFixed(1);
      setPhysicalData(prev => ({ ...prev, bmi }));
    }
  }, [physicalData.height, physicalData.weight]);

  const handlePhysicalChange = (field, value) => {
    setPhysicalData(prev => ({ ...prev, [field]: value }));
  };

  const handleMentalChange = (field, value) => {
    setMentalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // API call to save data
    console.log('Saving physical data:', physicalData);
    console.log('Saving mental data:', mentalData);
    setEditMode(false);
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return '';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Thiếu cân';
    if (bmiValue < 25) return 'Bình thường';
    if (bmiValue < 30) return 'Thừa cân';
    return 'Béo phì';
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return '#666';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return '#ff9800';
    if (bmiValue < 25) return '#4caf50';
    if (bmiValue < 30) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="physical-mental-container">
      <div className="physical-mental-header">
        <h2>Thể Lực và Tinh Thần</h2>
        <button 
          className={`edit-btn ${editMode ? 'save' : 'edit'}`}
          onClick={editMode ? handleSave : () => setEditMode(true)}
        >
          <i className={`fas ${editMode ? 'fa-save' : 'fa-edit'}`}></i>
          {editMode ? 'Lưu' : 'Chỉnh sửa'}
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'physical' ? 'active' : ''}`}
          onClick={() => setActiveTab('physical')}
        >
          <i className="fas fa-dumbbell"></i>
          Thể Lực
        </button>
        <button 
          className={`tab ${activeTab === 'mental' ? 'active' : ''}`}
          onClick={() => setActiveTab('mental')}
        >
          <i className="fas fa-brain"></i>
          Tinh Thần
        </button>
      </div>

      {activeTab === 'physical' && (
        <div className="tab-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <label>Chiều cao (cm)</label>
              <input
                type="number"
                value={physicalData.height}
                onChange={(e) => handlePhysicalChange('height', e.target.value)}
                disabled={!editMode}
                placeholder="Nhập chiều cao"
              />
            </div>
            <div className="metric-card">
              <label>Cân nặng (kg)</label>
              <input
                type="number"
                value={physicalData.weight}
                onChange={(e) => handlePhysicalChange('weight', e.target.value)}
                disabled={!editMode}
                placeholder="Nhập cân nặng"
              />
            </div>
            <div className="metric-card bmi-card">
              <label>BMI</label>
              <div className="bmi-display">
                <span className="bmi-value">{physicalData.bmi || '--'}</span>
                <span 
                  className="bmi-status"
                  style={{ color: getBMIColor(physicalData.bmi) }}
                >
                  {getBMIStatus(physicalData.bmi)}
                </span>
              </div>
            </div>
            <div className="metric-card">
              <label>Huyết áp</label>
              <input
                type="text"
                value={physicalData.bloodPressure}
                onChange={(e) => handlePhysicalChange('bloodPressure', e.target.value)}
                disabled={!editMode}
                placeholder="120/80 mmHg"
              />
            </div>
            <div className="metric-card">
              <label>Nhịp tim (bpm)</label>
              <input
                type="number"
                value={physicalData.heartRate}
                onChange={(e) => handlePhysicalChange('heartRate', e.target.value)}
                disabled={!editMode}
                placeholder="72"
              />
            </div>
            <div className="metric-card">
              <label>Thị lực</label>
              <select
                value={physicalData.vision}
                onChange={(e) => handlePhysicalChange('vision', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn mức độ</option>
                <option value="10/10">10/10 - Rất tốt</option>
                <option value="9/10">9/10 - Tốt</option>
                <option value="8/10">8/10 - Khá</option>
                <option value="7/10">7/10 - Trung bình</option>
                <option value="6/10">6/10 - Yếu</option>
                <option value="<6/10">&lt;6/10 - Rất yếu</option>
              </select>
            </div>
            <div className="metric-card full-width">
              <label>Đánh giá thể lực</label>
              <select
                value={physicalData.fitness}
                onChange={(e) => handlePhysicalChange('fitness', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn mức độ</option>
                <option value="excellent">Xuất sắc</option>
                <option value="good">Tốt</option>
                <option value="average">Trung bình</option>
                <option value="poor">Yếu</option>
                <option value="very-poor">Rất yếu</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mental' && (
        <div className="tab-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <label>Tâm trạng</label>
              <select
                value={mentalData.mood}
                onChange={(e) => handleMentalChange('mood', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn tâm trạng</option>
                <option value="very-happy">Rất vui</option>
                <option value="happy">Vui vẻ</option>
                <option value="normal">Bình thường</option>
                <option value="sad">Buồn</option>
                <option value="very-sad">Rất buồn</option>
              </select>
            </div>
            <div className="metric-card">
              <label>Mức độ căng thẳng</label>
              <select
                value={mentalData.stress}
                onChange={(e) => handleMentalChange('stress', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn mức độ</option>
                <option value="very-low">Rất thấp</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="very-high">Rất cao</option>
              </select>
            </div>
            <div className="metric-card">
              <label>Chất lượng giấc ngủ</label>
              <select
                value={mentalData.sleep}
                onChange={(e) => handleMentalChange('sleep', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn chất lượng</option>
                <option value="excellent">Xuất sắc</option>
                <option value="good">Tốt</option>
                <option value="average">Trung bình</option>
                <option value="poor">Kém</option>
                <option value="very-poor">Rất kém</option>
              </select>
            </div>
            <div className="metric-card">
              <label>Lo âu</label>
              <select
                value={mentalData.anxiety}
                onChange={(e) => handleMentalChange('anxiety', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn mức độ</option>
                <option value="none">Không có</option>
                <option value="mild">Nhẹ</option>
                <option value="moderate">Vừa</option>
                <option value="severe">Nặng</option>
                <option value="very-severe">Rất nặng</option>
              </select>
            </div>
            <div className="metric-card">
              <label>Khả năng tập trung</label>
              <select
                value={mentalData.concentration}
                onChange={(e) => handleMentalChange('concentration', e.target.value)}
                disabled={!editMode}
              >
                <option value="">Chọn mức độ</option>
                <option value="excellent">Xuất sắc</option>
                <option value="good">Tốt</option>
                <option value="average">Trung bình</option>
                <option value="poor">Kém</option>
                <option value="very-poor">Rất kém</option>
              </select>
            </div>
            <div className="metric-card full-width">
              <label>Ghi chú</label>
              <textarea
                value={mentalData.notes}
                onChange={(e) => handleMentalChange('notes', e.target.value)}
                disabled={!editMode}
                placeholder="Nhập ghi chú về tình trạng tinh thần..."
                rows="4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalMental;
